import * as THREE from "three";
import { easeInBack, easeInOutOvershoot } from "@/lib/home/scroll";

// ---------------------------------------------------------------------------
// Section copy (Figma: CFOCO Master File → "V2", node 574:230)
// ---------------------------------------------------------------------------

export type Section = {
  id: string;
  kicker?: string;
  title: string;
  body?: string;
  subBody?: string;
  bullets?: string[];
  gradient?: boolean;
  layout:
    | "split" // title left, body right (frames 1468/1469/1459)
    | "top-center-body-right" // 1460
    | "center" // 1461
    | "left-bullets" // 1462
    | "top-center" // 1463
    | "top-left-body-br" // 1464
    | "bottom-left" // 1471
    | "top-left"; // 1466 / 1467
};

export const SECTIONS: Section[] = [
  {
    id: "fresh",
    title: "A Journey of\n Ingredients, Flavor,\n and Craft",
    body: "What begins with fresh ingredients unfolds into a complete culinary journey. Scroll to explore each stage, from preparation and seasoning to cooking and serving.",
    layout: "split",
  },
  {
    id: "flavor",
    title: "A Blend Of Flavors\nIn Every Layer",
    body: "Selected Spices Come Together In A Unique Blend Designed To Enhance Every Bite. Each Piece Is Coated With Care, So The Flavor Runs Deep Through Every Layer.",
    layout: "split",
  },
  {
    id: "crispy",
    title: "Crispy On The\nOutside, Tender Within",
    body: "The Cooking Process Locks In Flavor While Creating A Perfectly Crisp Exterior. The Result Is A Delicious Balance Of Tenderness And Crunch, Crafted To Be Enjoyed In Every Bite.",
    layout: "split",
  },
  {
    id: "final-crunch",
    title: "The Final Crunch",
    body: "After Hours Of Preparation And Precision, What Emerges Is The Perfect Piece Of Fried Chicken — Golden, Crispy, And Packed With Bold Flavor.",
    layout: "top-center-body-right",
  },
  {
    id: "moment",
    kicker: "The Moment",
    title: "You've Been Waiting For",
    layout: "center",
  },
  {
    id: "next-gen",
    title: "The Next\nGeneration\nOf Fast Food",
    bullets: [
      "Smart Ordering, Powered By AI",
      "Speed Delivered In Seconds",
      "Future-Ready Flavors, Crafted Today",
    ],
    gradient: true,
    layout: "left-bullets",
  },
  {
    id: "signature",
    title: "The Signature Experience",
    gradient: true,
    layout: "top-center",
  },
  {
    id: "checkout",
    title: "Checkout,\nReimagined",
    body: "No Queues. No Delays. Just A Seamless Checkout Experience Powered By Intelligent Automation.",
    subBody: "Because Great Food Shouldn't Come With Long Waits.",
    gradient: true,
    layout: "top-left-body-br",
  },
  {
    id: "kitchen",
    kicker: "Where The",
    title: "Crunch Comes Alive",
    body: "Every Batch Is Fried To Perfection Using Carefully Controlled Temperatures That Lock In Juicy Tenderness While Creating Our Signature Golden Crisp.",
    gradient: true,
    layout: "bottom-left",
  },
  {
    id: "journey",
    kicker: "The Journey",
    title: "Ends In Your Hands",
    body: "From Fresh Ingredients To The Perfect Fry, Every Step Has Led To This Moment. Thoughtfully Packed, Beautifully Presented, And Ready To Deliver The Unmistakable Taste Of CFOCO.",
    gradient: true,
    layout: "top-left",
  },
  {
    id: "future",
    kicker: "Served",
    title: "By The Future",
    body: "As Your Order Is Ready, Our Autonomous Serving Robot Delivers It Straight To Your Table With Precision, Speed, And A Touch Of Innovation. A Seamless Blend Of Technology, Hospitality, And Unforgettable Flavor.",
    gradient: true,
    layout: "top-left",
  },
];

export const SECTION_COUNT = SECTIONS.length;

/** section copy on/off. Off for now: the scroll, the models and the layout code all stay, only the text isn't drawn */
export const SHOW_COPY = false;

// ---------------------------------------------------------------------------
// Outro: after the last section the camera leaves its locked spot for the only
// time — it travels down the room into the neon CFOCO logo on the back wall,
// and the footer rises in under it.
// ---------------------------------------------------------------------------

const LAST = SECTIONS.length - 1;
/** scroll the scenes have outgrown the copy by (the kitchen, the meal and the robot run past the last section), in section units */
const SCENES_PAST_COPY = 2.6;
/** where the outro starts counting from */
const OUTRO_AT = LAST + SCENES_PAST_COPY;
/** extra scroll after that, in section units */
export const OUTRO_LENGTH = 1.5;
/** the page's full progress range */
export const PROGRESS_MAX = OUTRO_AT + OUTRO_LENGTH;
/** camera travel */
export const ZOOM_FROM = OUTRO_AT + 0.3;
export const ZOOM_TO = OUTRO_AT + 1.2;
/** footer reveal, overlapping the end of the travel */
export const FOOTER_FROM = OUTRO_AT + 0.85;
export const FOOTER_TO = OUTRO_AT + 1.3;

/** the neon logo on the back wall (room space, from interior_environment.glb) */
export const LOGO = {
  center: new THREE.Vector3(0.08, 2.53, -7.62),
  /** where the camera stops: square on, far enough back that the whole word fits */
  distance: 7,
  /** the camera aims this far below the logo's centre, so it sits just above the middle — links above, credits below */
  aimBelow: 0.15,
};

// ---------------------------------------------------------------------------
// Camera. The room never moves: one locked view for every section. It is the
// "Camera" node authored inside interior_environment.glb (eye height, looking
// straight down -Z, 53.7° vertical fov). Objects move in front of it instead.
// ---------------------------------------------------------------------------

export const CAMERA = {
  position: new THREE.Vector3(0, 2.0387, 13.5099),
  target: new THREE.Vector3(0, 2.0387, -40.0),
  fov: 53.7,
};

// ---------------------------------------------------------------------------
// Hero: raw chicken (animated) → dissolves into the fried chicken → rises, the
// bucket comes up from the bottom of the frame, the chicken is tossed up and
// falls back into the bucket's pile (the model's baked drop, see DROP_SIM).
//
// Everything is placed relative to the locked camera, in metres:
//   x = right of the lens axis, y = above it, d = distance in front of the lens.
// ---------------------------------------------------------------------------

export const CHICKEN_LENGTH = 1.6; // long axis of the chicken, metres
export const BUCKET_HEIGHT = 2.4;
/** turns the printed logo to face the lens */
export const BUCKET_YAW = 4.7;

/** scroll progress over which the chicken rises into frame */
export const FADE_IN = 0.9;

/** raw → fried dissolve (0 = raw, 1 = fried) */
export const SWAP_FROM = 1.8;
export const SWAP_TO = 2.5;

// ---------------------------------------------------------------------------
// The ordering wall. Once the chicken has dropped into the bucket the camera
// leaves its spot and swings round to the room's left wall, where the three
// ordering kiosks stand; the bucket (chicken inside) travels over and stands
// in front of the middle one; the robot (ROBOT_RUN) then takes it away. The camera
// then moves on to the vending machine on the right (VEND_VIEW); the kiosks always stay.
// World space (metres), floor at y = 0.
// ---------------------------------------------------------------------------

export const WALL = {
  /** the camera swings over… */
  panFrom: 4.6,
  panTo: 5.4,
  /** …and moves on to the vending machine (VEND_VIEW) */
  backFrom: 7.3,
  backTo: 7.9,
  /** the view of the wall: the kiosks run along it, the bucket in front of the middle one */
  /** square on to the wall: looking straight along -x */
  eye: new THREE.Vector3(-0.2, 1.8, 6.7),
  target: new THREE.Vector3(-6.3, 1.3, 6.7),
  fov: 56,
  /** where the bucket stands (base-centre): in front of the middle kiosk (z 6.7) */
  bucket: new THREE.Vector3(-3.6, 0, 6.7),
};

/** `ease` (optional) shapes the segment that ends on this key */
export type Pose = { p: number; x: number; y: number; d: number; s: number; ease?: (t: number) => number };

/** bucket size on screen (1 = BUCKET_HEIGHT, the cup without its pile) */
const BUCKET_S = 0.6;
/** the pose keys below stop here: the bucket then belongs to the robot (ROBOT_RUN) */
const ROBOT_RUN_FROM = 6.0;
/** where the cup's rim sits when the bucket is "up": the whole bucket (cup, logo and pile) is in frame, centred, with room above for the hovering chicken */
const BUCKET_RIM_Y = 0.1;
/** bucket base-centre height when it is "up" */
const BUCKET_UP_Y = BUCKET_RIM_Y - BUCKET_HEIGHT * BUCKET_S;
/** the hovering chicken sits a little behind the bucket (4.0), so it drops into the back half of the cup */
const CHICKEN_HOVER_D = 4.4;
/** where the falling chicken ends, sunk into the cup (its top just below the rim) */
export const CHICKEN_LAND_Y = BUCKET_RIM_Y - 0.65;
/** low enough that even the top of the pile (≈0.4 × the cup above the rim) is out of frame */
const HIDDEN_Y = -2.4 - BUCKET_HEIGHT * BUCKET_S * 1.4;
/** below the bottom of the frame at the chicken's distance, with its full length clear */
const CHICKEN_HIDDEN_Y = -3.2;
/** the chicken starts rising after "The Final Crunch"… */
export const RISE_FROM = 3.35;
/** …reaches its hover spot; only then does the bucket start coming up */
export const HOVER_AT = 3.7;
/** bucket fully up */
const BUCKET_UP_AT = 4.25;
/** the chicken lets go (spin stops) and drops into the bucket… */
export const DROP_START = 4.3;
/** …and has landed; the pile has settled by the end of the drop clock */
export const TOSS_OUT = 4.5;

/**
 * The bucket model (bucket_drop.glb) carries a baked physics drop: one piece
 * falls from far above into the pile and the others jostle. Clip seconds:
 */
export const DROP_SIM = {
  /** where playback starts — the falling piece is still well above the frame */
  from: 1.2,
  /** the piece hits the pile */
  impact: 1.75,
  /** everything has settled */
  settle: 4.4,
};

/** chicken while it is free (before it drops into the bucket) */
export const CHICKEN_KEYS: Pose[] = [
  { p: 0, x: 0, y: CHICKEN_HIDDEN_Y, d: 4.0, s: 1.05 },
  { p: 1.0, x: 0, y: 0.0, d: 4.0, s: 1.05, ease: easeInOutOvershoot }, // pops up, settles — like the bucket
  // hold perfectly still while raw swaps to fried (SWAP_FROM..SWAP_TO)
  { p: SWAP_TO, x: 0, y: 0.0, d: 4.0, s: 1.05 },
  // …and keeps holding through "The Final Crunch" (section 3, text visible ≈2.6–3.4)
  { p: RISE_FROM, x: 0, y: 0.0, d: 4.0, s: 1.05 },
  // rises to hover above where the bucket mouth will be…
  { p: HOVER_AT, x: 0, y: 1.2, d: CHICKEN_HOVER_D, s: 0.62 },
  // …and waits there while the bucket comes up from below; from DROP_START it falls straight
  // into the cup in real time (HeroChicken, driven by the bucket's drop clock)
  { p: TOSS_OUT, x: 0, y: 1.2, d: CHICKEN_HOVER_D, s: 0.62 },
];

/** bucket base-centre. Rises from below the frame once the chicken is up; from WALL.panFrom it travels to the kiosks (HeroChicken), where the robot takes it. */
export const BUCKET_KEYS: Pose[] = [
  { p: HOVER_AT, x: 0, y: HIDDEN_Y, d: 4.0, s: BUCKET_S },
  { p: BUCKET_UP_AT, x: 0, y: BUCKET_UP_Y, d: 4.0, s: BUCKET_S, ease: easeInOutOvershoot }, // pops up, settles
  { p: ROBOT_RUN_FROM, x: 0, y: BUCKET_UP_Y, d: 4.0, s: BUCKET_S },
  { p: 99, x: 0, y: BUCKET_UP_Y, d: 4.0, s: BUCKET_S }, // it stays: on the robot for the rest of the page
];

/** progress ranges where the hero is out of frame and can skip rendering */
export const HERO_HIDDEN: [number, number][] = [[1e9, Infinity]];

/** progress range over which the raw chicken's authored animation plays */
export const ANIM_FROM = 0.1;
export const ANIM_TO = 1.8;

// ---------------------------------------------------------------------------
// Machines rising from below the frame (RisingMachines). The ordering kiosks
// stand along the left wall (see WALL) and the vending machine on the right (see
// VEND_VIEW), all up from the intro on.
// Same camera-relative placement as the hero (x right, y up, d forward).
// ---------------------------------------------------------------------------

export type RisingMachine = {
  /** where it stands, base-centre */
  x: number;
  y: number;
  d: number;
  /** turned toward the centre, radians */
  yaw: number;
  /** rises over [from, to]… */
  from: number;
  to: number;
  /** …and sinks away over [outFrom, outTo] */
  outFrom: number;
  outTo: number;
};

export const KIOSK_URL = "/models/ordering_machine_new.glb";
/** kiosk height, metres (the model is ≈1.9 m) — they stand in the room (world space) along its left wall, not in front of the lens: x = along the room's width, y = floor, d = z */
export const KIOSK_HEIGHT = 2.8;
/** turns the model's front to +z (toward the lens) before the room placement below */
export const KIOSK_FACING = Math.PI / 2;
const WALL_KIOSK_X = -6.0;
const WALL_KIOSK_Z = 6.7;
/** the model's front faces +z; a quarter turn puts it on +x, into the room */
const FACE_ROOM = Math.PI / 2;
export const KIOSKS: RisingMachine[] = [
  // they slide up out of the floor with the intro (from / to: seconds after it starts) and stay: the middle one first
  // (the bucket comes to it later), then the two either side, angled in
  { x: WALL_KIOSK_X, y: 0, d: WALL_KIOSK_Z, yaw: FACE_ROOM, from: 0.2, to: 1.1, outFrom: 0, outTo: 0 },
  { x: WALL_KIOSK_X, y: 0, d: WALL_KIOSK_Z - 2.0, yaw: FACE_ROOM - 0.3, from: 0.45, to: 1.35, outFrom: 0, outTo: 0 },
  { x: WALL_KIOSK_X, y: 0, d: WALL_KIOSK_Z + 2.0, yaw: FACE_ROOM + 0.3, from: 0.7, to: 1.6, outFrom: 0, outTo: 0 },
];

export const VENDING_URL = "/models/vending_new.glb";
/** vending machine height, metres (the model is ≈0.75 m, so it is scaled up; deep, so it takes ≈1.5 m of floor) — it stands in the room (world space) on the right, against the right wall, in front of the right-hand booths (nearer the camera, out of the hero view) */
export const VENDING_HEIGHT = 2.7;
/** the model's front faces +z already */
export const VENDING_FACING = 0;
const VENDING_X = 6.6;
const VENDING_Z = 9.0;
export const VENDING: RisingMachine[] = [
  // slides up out of the floor with the intro (seconds after it starts) and stays; the front looks into the room, turned a little toward the camera's side (the camera looks across from the front-left)
  { x: VENDING_X, y: 0, d: VENDING_Z, yaw: -Math.PI / 2 + 0.6, from: 0.9, to: 1.8, outFrom: 0, outTo: 0 },
];

/**
 * The vending view. When the camera has finished at the ordering wall it swings
 * across the room to the vending machine, then returns for the kitchen.
 */
export const VEND_VIEW = {
  /** from the wall's view to this one is WALL.backFrom → backTo; from here on to the kitchen, KITCHEN.outFrom → outTo */
  eye: new THREE.Vector3(3.0, 1.8, 13.5),
  target: new THREE.Vector3(VENDING_X, 1.3, VENDING_Z),
  fov: 56,
};

// ---------------------------------------------------------------------------
// Kitchen (kitchen_layer_new.glb), on the restaurant's open side, where it was
// built. It always stands there. For its step the camera leaves its locked spot
// for the kitchen's own authored camera (the "Camera" node in the model) and
// comes back.
// ---------------------------------------------------------------------------

/**
 * The model is in its own frame; this puts it into the room's. It is the placement the first kitchen cut was moved by
 * (x 8.08, z 7.97, turned 180°), then moved on 6.3 m (+z) so the whole kitchen stands behind the main camera (z 13.5):
 * it never gets into the hero view, and its open front looks out the back of the room.
 */
const KITCHEN_ORIGIN = new THREE.Vector3(8.0826, 0, 7.9703 + 6.3);
const KITCHEN_TURN = Math.PI;
/** the model's authored camera, in its own frame (looking +z) */
const KITCHEN_CAM = new THREE.Vector3(3.4351, 1.932, -9.5943);

export const KITCHEN = {
  origin: KITCHEN_ORIGIN,
  turn: KITCHEN_TURN,
  /** the camera moves on into it, straight from the vending machine… */
  outFrom: 9.4,
  outTo: 10.1,
  /** …and comes back to its spot */
  backFrom: 11.3,
  backTo: 12.4,
  /** the authored camera, in the room's frame: looks straight down -z into the kitchen */
  eye: new THREE.Vector3(KITCHEN_ORIGIN.x - KITCHEN_CAM.x, KITCHEN_CAM.y, KITCHEN_ORIGIN.z - KITCHEN_CAM.z),
  target: new THREE.Vector3(KITCHEN_ORIGIN.x - KITCHEN_CAM.x, KITCHEN_CAM.y, KITCHEN_ORIGIN.z - KITCHEN_CAM.z - 8),
  /** the authored lens */
  fov: 53.7,
};


// ---------------------------------------------------------------------------
// The serving robot ("Served By The Future"). Once the bucket stands at the
// ordering wall the robot slides up out of the floor beside it, the bucket hops
// onto its tray and the robot drives it across the restaurant to the vending
// machine; after that it keeps rolling up and down the middle of the room.
// World space (metres), floor at y = 0. Scroll positions as everywhere else.
// ---------------------------------------------------------------------------

export const ROBOT_URL = "/models/serve_robot.glb";
/** height, metres (the model is ≈1.9 m) */
export const ROBOT_HEIGHT = 2.0;
/** turns the model's front to +z (its direction of travel is +z in the code) */
export const ROBOT_FACING = 0;

const ROBOT_START = new THREE.Vector3(-3.4, 0, 5.0);

export const ROBOT_RUN = {
  /** slides up out of the floor… */
  riseFrom: 5.9,
  riseTo: 6.4,
  /** …the bucket hops onto it… */
  loadFrom: 6.4,
  loadTo: 6.9,
  /** …it drives to the vending machine… */
  driveFrom: 6.9,
  driveTo: 8.3,
  /** …waits there, then carries on into the kitchen (the camera goes with it)… */
  kitchenFrom: 8.6,
  kitchenTo: 9.8,
  /** …and rolls back out by itself, then off on patrol */
  /** (on its own clock, not the scroll: once the camera has reached the kitchen it waits `exitDelay` seconds, then drives out in `exitTime` and carries on patrolling) */
  exitAt: 10.1,
  exitDelay: 0.8,
  exitTime: 6,
  start: ROBOT_START,
  /** the way across: along the wall, behind the camera's spot at the wall, then over to the vending machine */
  route: [
    ROBOT_START,
    new THREE.Vector3(-3.1, 0, 7.6),
    new THREE.Vector3(-1.4, 0, 10.1),
    new THREE.Vector3(1.8, 0, 10.7),
    new THREE.Vector3(4.5, 0, 9.5),
  ],
  /** on from the vending machine through the kitchen's doorway (the front wall at z 14.3 runs from x -0.2 to the right, so the way in is on the left of it; counters stand at x 0.9–4.5, z 14.3–15.3), room coords */
  kitchenRoute: [
    new THREE.Vector3(4.5, 0, 9.5),
    new THREE.Vector3(2.6, 0, 11.3),
    new THREE.Vector3(-0.6, 0, 12.6),
    new THREE.Vector3(-2.4, 0, 13.6),
    new THREE.Vector3(-2.6, 0, 15.2),
    new THREE.Vector3(-1.4, 0, 17.0),
    new THREE.Vector3(1.0, 0, 18.4),
    new THREE.Vector3(3.2, 0, 18.8),
  ],
  /** and back out through the same doorway, then straight into the room (it joins the patrol from there, not via the vending machine) */
  exitRoute: [
    new THREE.Vector3(3.2, 0, 18.8),
    new THREE.Vector3(1.0, 0, 18.4),
    new THREE.Vector3(-1.4, 0, 17.0),
    new THREE.Vector3(-2.6, 0, 15.2),
    new THREE.Vector3(-2.4, 0, 13.6),
    new THREE.Vector3(-1.8, 0, 11.4),
    new THREE.Vector3(-1.0, 0, 8.6),
  ],
  /** the middle aisle, a closed loop (seconds per lap) */
  patrol: { centre: new THREE.Vector3(-0.5, 0, 5.0), rx: 1.0, rz: 3.5, lap: 45 },
  /**
   * The robot's trays (measured on the model): four discs between two pillars, the top one at 0.735 of its height,
   * then 0.565, 0.41 and 0.255; ≈0.3 m apart. The pillars stand at local z ±0.41 (z runs along the tray), x runs
   * across it. The bucket takes the top tray (`trayY`, its centre) and the coke and fries the one below it.
   */
  trayY: 0.74,
  trayBack: 0,
  trays: [
    { url: "/models/fries.glb", trayY: 0.575, height: 0.26, x: 0, z: -0.17, yaw: -Math.PI / 2 },
    { url: "/models/coke.glb", trayY: 0.575, height: 0.26, x: 0, z: 0.17, yaw: 0 },
  ],
  /** the bucket's size on the tray, relative to its size at the wall */
  bucketScale: 0.33,
};

/**
 * Optional models for the later sections. Anchors are camera-relative:
 * `forward` metres in front of the lens, `right`/`up` offsets from its axis.
 * Drop a GLB into /public/models and set `url` to show it.
 */
export const MODEL_SLOTS: {
  section: string;
  url: string | null;
  anchor: { forward: number; right: number; up: number };
  scale?: number;
}[] = [
  { section: "next-gen", url: null, anchor: { forward: 3.2, right: 0, up: -0.3 } },
  { section: "signature", url: null, anchor: { forward: 3.6, right: 0, up: -0.3 } },
  { section: "checkout", url: null, anchor: { forward: 3.4, right: 0, up: -0.4 } },
  { section: "kitchen", url: null, anchor: { forward: 4.5, right: 0.4, up: -0.6 } },
  { section: "future", url: null, anchor: { forward: 3.2, right: 0.2, up: -0.4 } },
];
