import * as THREE from "three";

/**
 * Pose-normalises a model so two different meshes of "the same thing" (raw and
 * fried chicken) end up with the same orientation, centre and length — which is
 * what lets one be swapped for the other without a visible jump.
 *
 * Works from the vertices: principal axes (PCA) give the orientation, the sign
 * of each axis is fixed by skewness (thick end → +), the bounding box in that
 * frame gives the centre and length.
 *
 * Returns a group whose origin is the model's centre and whose X axis is its
 * long axis, scaled so that axis is `length` metres.
 */
export function normalizeByPrincipalAxes(root: THREE.Object3D, length: number) {
  root.updateMatrixWorld(true);

  const points: THREE.Vector3[] = [];
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const pos = mesh.geometry.getAttribute("position");
    const stride = Math.max(1, Math.floor(pos.count / 40000));
    for (let i = 0; i < pos.count; i += stride) {
      points.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld));
    }
  });

  const mean = new THREE.Vector3();
  for (const p of points) mean.add(p);
  mean.divideScalar(points.length);

  // covariance (symmetric 3×3)
  const c = [0, 0, 0, 0, 0, 0]; // xx xy xz yy yz zz
  for (const p of points) {
    const x = p.x - mean.x, y = p.y - mean.y, z = p.z - mean.z;
    c[0] += x * x; c[1] += x * y; c[2] += x * z;
    c[3] += y * y; c[4] += y * z; c[5] += z * z;
  }
  const A = [
    [c[0], c[1], c[2]],
    [c[1], c[3], c[4]],
    [c[2], c[4], c[5]],
  ].map((r) => r.map((v) => v / points.length));
  const { values, vectors } = jacobi3(A);

  const order = [0, 1, 2].sort((a, b) => values[b] - values[a]);
  const axes = order.map((i) => new THREE.Vector3(vectors[0][i], vectors[1][i], vectors[2][i]));

  // fix signs by skewness: the heavy tail points to -, so flip to make the skew positive
  for (let k = 0; k < 2; k++) {
    let skew = 0;
    for (const p of points) skew += Math.pow(p.clone().sub(mean).dot(axes[k]), 3);
    if (skew < 0) axes[k].negate();
  }
  axes[2].crossVectors(axes[0], axes[1]);

  // model → canonical frame: Bᵀ (v − mean)
  const toCanon = new THREE.Matrix4().makeBasis(axes[0], axes[1], axes[2]).transpose();
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const q = new THREE.Vector3();
  for (const p of points) {
    q.copy(p).sub(mean).applyMatrix4(toCanon);
    min.min(q);
    max.max(q);
  }
  const mid = min.clone().add(max).multiplyScalar(0.5);
  const scale = length / (max.x - min.x);

  const m = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(new THREE.Matrix4().makeTranslation(-mid.x, -mid.y, -mid.z))
    .multiply(toCanon)
    .multiply(new THREE.Matrix4().makeTranslation(-mean.x, -mean.y, -mean.z));

  const holder = new THREE.Group();
  holder.matrixAutoUpdate = false;
  holder.matrix.copy(m);
  holder.add(root);
  const wrapper = new THREE.Group();
  wrapper.add(holder);
  return { object: wrapper, size: max.clone().sub(min).multiplyScalar(scale) };
}

/** Eigen-decomposition of a symmetric 3×3 (cyclic Jacobi). Vectors are columns. */
function jacobi3(a: number[][]) {
  const A = a.map((r) => r.slice());
  const V = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  for (let sweep = 0; sweep < 24; sweep++) {
    const off = Math.abs(A[0][1]) + Math.abs(A[0][2]) + Math.abs(A[1][2]);
    if (off < 1e-14) break;
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(A[p][q]) < 1e-18) continue;
      const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const cs = 1 / Math.sqrt(t * t + 1);
      const sn = t * cs;
      for (let k = 0; k < 3; k++) {
        const akp = A[k][p], akq = A[k][q];
        A[k][p] = cs * akp - sn * akq;
        A[k][q] = sn * akp + cs * akq;
      }
      for (let k = 0; k < 3; k++) {
        const apk = A[p][k], aqk = A[q][k];
        A[p][k] = cs * apk - sn * aqk;
        A[q][k] = sn * apk + cs * aqk;
      }
      for (let k = 0; k < 3; k++) {
        const vkp = V[k][p], vkq = V[k][q];
        V[k][p] = cs * vkp - sn * vkq;
        V[k][q] = sn * vkp + cs * vkq;
      }
    }
  }
  return { values: [A[0][0], A[1][1], A[2][2]], vectors: V };
}
