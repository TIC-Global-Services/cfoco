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
const SCENES_PAST_COPY = 0.2;
/** where the outro starts counting from */
const OUTRO_AT = LAST + SCENES_PAST_COPY;
/** extra scroll after that, in section units */
export const OUTRO_LENGTH = 1.5;
/** the page's full progress range */
export const PROGRESS_MAX = OUTRO_AT + OUTRO_LENGTH;
/** camera travel */
export const ZOOM_FROM = OUTRO_AT + 0.3;
export const ZOOM_TO = OUTRO_AT + 1.2;
/** footer reveal, as the camera settles in front of the logo */
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
  // in front of the kitchen's front wall (z 12.0), which closes the room behind it
  position: new THREE.Vector3(0, 2.0387, 11.7),
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
/** the bucket the chicken drops into (HeroChicken), also pictured on the centre kiosk's screen (RisingMachines) */
export const BUCKET_URL = "/models/bucket_drop_new.glb";
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
  panFrom: 4.95, // …only once the bucket has shrunk and been seen (BUCKET_KEYS)
  panTo: 5.6,
  /** the view of the wall: the kiosks run along it, the bucket in front of the middle one */
  /** square on to the wall: looking straight along -x */
  eye: new THREE.Vector3(-0.2, 1.8, 6.7),
  target: new THREE.Vector3(-6.3, 1.3, 6.7),
  fov: 56,
  /** where the bucket stands (base-centre): in front of the middle kiosk (z 6.7) */
  bucket: new THREE.Vector3(-3.6, 0, 6.7),
  /** the middle kiosk's screen, its centre (world space; the screen is ≈0.65 m wide, ≈1.0 m tall): the bucket slips into it, shrinking, then comes back out for the robot */
  screen: new THREE.Vector3(-5.85, 1.9, 6.7),
  /** the bucket waits this far (metres) in front of the screen while the camera settles, then fades out over enterFrom → enterTo (the screen shows its flat picture instead) */
  hoverOff: 0.2,
  enterFrom: 5.7,
  enterTo: 5.82,
  /** bucket size while in front of the screen, relative to its hero size (the wall size is 0.62) */
  screenScale: 0.31,
};

/** `ease` (optional) shapes the segment that ends on this key */
export type Pose = { p: number; x: number; y: number; d: number; s: number; ease?: (t: number) => number };

/** bucket size on screen (1 = BUCKET_HEIGHT, the cup without its pile) once the chicken is in and it heads for the kiosks */
const BUCKET_S = 0.6;
/** …and while the chicken drops in: big, in proportion to the chicken at its full size (the cup shrinks after, not the chicken before) */
const BUCKET_BIG = 1.0;
/** the pose keys below stop here: the bucket then belongs to the robot (ROBOT_RUN) */
const ROBOT_RUN_FROM = 6.0;
/** where the cup's rim sits when the bucket is "up": the whole bucket (cup, logo and pile) is in frame, centred, with room above for the hovering chicken */
const BUCKET_RIM_Y = -0.6;
/** bucket base-centre height when it is "up" */
export const BUCKET_UP_Y = BUCKET_RIM_Y - BUCKET_HEIGHT * BUCKET_BIG;
/** base-centre height once it has shrunk (its rim stays where it was) */
const BUCKET_SMALL_Y = BUCKET_UP_Y + BUCKET_HEIGHT * (BUCKET_BIG - BUCKET_S);
/** the hovering chicken sits a little behind the bucket (4.0), so it drops into the back half of the cup */
const CHICKEN_HOVER_D = 4.4;
/** where the falling chicken ends, sunk into the cup (its top just below the rim) */
export const CHICKEN_LAND_Y = BUCKET_RIM_Y - 1.1;
/** low enough that even the top of the pile (≈0.4 × the cup above the rim) is out of frame */
const HIDDEN_Y = -2.4 - BUCKET_HEIGHT * BUCKET_BIG * 1.4;
/** below the bottom of the frame at the chicken's distance, with its full length clear */
const CHICKEN_HIDDEN_Y = -3.2;
/** the chicken starts rising after "The Final Crunch"… */
export const RISE_FROM = 3.35;
/** …reaches its hover spot; only then does the bucket start coming up */
export const HOVER_AT = 3.7;
/** bucket fully up */
const BUCKET_UP_AT = 4.25;
/** the chicken lets go (spin stops) and drops into the bucket — while it is still rising the last stretch, so the chicken meets it on the way up (not after it has stopped) */
export const DROP_START = 4.05;
/** …and has landed; the pile has settled by the end of the drop clock */
export const TOSS_OUT = 4.5;

/**
 * The bucket model (bucket_drop_new.glb) carries a baked physics drop: one piece
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
  // shrinks to fit the cup, where it is (no rise)…
  { p: HOVER_AT, x: 0, y: 0.0, d: CHICKEN_HOVER_D, s: 1.05 },
  // …and waits there while the bucket comes up from below; from DROP_START it falls straight
  // into the cup in real time (HeroChicken, driven by the bucket's drop clock)
  { p: TOSS_OUT, x: 0, y: 0.0, d: CHICKEN_HOVER_D, s: 1.05 },
];

/** bucket base-centre. Rises from below the frame once the chicken is up; from WALL.panFrom it travels to the kiosks (HeroChicken), where the robot takes it. */
export const BUCKET_KEYS: Pose[] = [
  { p: HOVER_AT, x: 0, y: HIDDEN_Y, d: 4.0, s: BUCKET_BIG },
  { p: BUCKET_UP_AT, x: 0, y: BUCKET_UP_Y, d: 4.0, s: BUCKET_BIG, ease: easeInOutOvershoot }, // pops up big, settles
  // the chicken drops in (DROP_START → TOSS_OUT); only then does the bucket shrink, rim fixed, as it sets off for the kiosks
  { p: TOSS_OUT + 0.1, x: 0, y: BUCKET_UP_Y, d: 4.0, s: BUCKET_BIG },
  { p: TOSS_OUT + 0.4, x: 0, y: BUCKET_SMALL_Y, d: 4.0, s: BUCKET_S, ease: (t) => t * t * (3 - 2 * t) },
  { p: ROBOT_RUN_FROM, x: 0, y: BUCKET_SMALL_Y, d: 4.0, s: BUCKET_S },
  { p: 99, x: 0, y: BUCKET_SMALL_Y, d: 4.0, s: BUCKET_S }, // it stays: on the robot for the rest of the page
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

export const KIOSK_URL = "/models/ordering_machine_final.glb";
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

// ---------------------------------------------------------------------------
// Kitchen (new_kitchen_animate.glb), on the restaurant's open side, where it was
// built. It always stands there. For its step the camera leaves its locked spot
// for the kitchen's authored camera view, looks round the whole kitchen, and
// comes back out through the doorway.
// ---------------------------------------------------------------------------

/**
 * The model is in its own frame; this puts it into the room's (turned 180°). Its front wall, with the doorway on the
 * left (x -5.1 to -0.2), stands at z 12.0–12.2: flush with the restaurant's open end (z 12.0), so the two meet with
 * no gap. The whole kitchen stands behind the main camera, so it never gets into the hero view.
 */
const KITCHEN_ORIGIN = new THREE.Vector3(8.0826, 0, 12.24);
const KITCHEN_TURN = Math.PI;
/** the model's authored camera, in its own frame (looking +z) */
const KITCHEN_CAM = new THREE.Vector3(2.9581, 1.932, -8.4446);

export const KITCHEN = {
  origin: KITCHEN_ORIGIN,
  turn: KITCHEN_TURN,
  /** the camera moves on into it, straight from the ordering wall… */
  outFrom: 6.2,
  outTo: 7.1,
  /** …holds the kitchen view (outTo → exitFrom: the robot takes the bucket and drives to the middle of the room meanwhile, unseen), then leaves through the doorway… */
  exitFrom: 8.2,
  exitTo: 9.2,
  /** …along this path (room frame): out of the kitchen's doorway (x -7.3 to -3.4, front wall z 12.0–12.2) and on to… */
  exitPath: [
    new THREE.Vector3(0.5, 1.9, 17.8),
    new THREE.Vector3(-4.6, 1.9, 14.0),
    new THREE.Vector3(-5.3, 1.9, 12.0),
    new THREE.Vector3(-3.0, 1.85, 10.8),
  ],
  /** …the view of the robot waiting in the middle of the room (it faces the camera; the outro takes the camera on from here) */
  viewEye: new THREE.Vector3(0, 1.8, 10.4),
  viewAim: new THREE.Vector3(0, 1.0, 6.4),
  /** the authored camera, in the room's frame: looks straight down -z into the kitchen */
  eye: new THREE.Vector3(KITCHEN_ORIGIN.x - KITCHEN_CAM.x, KITCHEN_CAM.y, KITCHEN_ORIGIN.z - KITCHEN_CAM.z),
  target: new THREE.Vector3(KITCHEN_ORIGIN.x - KITCHEN_CAM.x, KITCHEN_CAM.y, KITCHEN_ORIGIN.z - KITCHEN_CAM.z - 8),
  /** the authored lens */
  fov: 53.7,
};


// ---------------------------------------------------------------------------
// The serving robot ("Served By The Future"). It stands parked by the ordering
// kiosks. The bucket slips into the middle kiosk's screen; as the camera leaves
// for the kitchen the bucket hops onto the robot's tray, and the robot drives to
// the middle of the room and waits there facing the camera (+z), bucket aboard,
// while the camera is in the kitchen; the camera then comes out to it.
// World space (metres), floor at y = 0. Scroll positions as everywhere else.
// ---------------------------------------------------------------------------

export const ROBOT_URL = "/models/serve_robot.glb";
/** height, metres (the model is ≈1.9 m) */
export const ROBOT_HEIGHT = 2.0;
/** turns the model's front to +z (its direction of travel is +z in the code) */
export const ROBOT_FACING = 0;

const ROBOT_START = new THREE.Vector3(-3.4, 0, 5.0);
/** where it waits from the start: parked beside the first kiosk (z 4.7), facing into the room */
const ROBOT_PARK = new THREE.Vector3(-5.4, 0, 3.2);
/** where it waits, in the middle of the room, facing the camera (+z): the camera comes out of the kitchen to it (see JOURNEY) */
export const ROBOT_STOP = new THREE.Vector3(0, 0, 6.4);

export const ROBOT_RUN = {
  /** the bucket changes from the kiosk screen to the robot's tray, unseen, once the camera has swung away from the wall (it is backing into the kitchen, see JOURNEY) */
  loadAt: 6.8,
  /** …the robot drives to the middle of the room, while the camera is in the kitchen */
  driveFrom: 6.5,
  driveTo: 7.6,
  /** its heading where it waits, radians (0 = square to the camera; a turn from that shows the bucket on its tray, which stands behind its face) */
  stopYaw: 0.9,
  start: ROBOT_START,
  /** from its parking spot, round the middle aisle to the middle of the room. Edit it on the page: ?debug. */
  route: [
    ROBOT_PARK,
    new THREE.Vector3(-4.4, 0, 4.0),
    ROBOT_START,
    new THREE.Vector3(-1.8, 0, 6.2),
    ROBOT_STOP,
  ],
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
  /** the bucket's size on the tray, relative to its size in the screen */
  bucketScale: 0.66,
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

// ---------------------------------------------------------------------------
// Lights in the three.js editor (?debug → "Lights ↔ three.js editor"): the room
// is exported with its lights, they are moved in threejs.org/editor, and
// `npm run lights:import <file>` writes them back into controls.ts.
// ---------------------------------------------------------------------------

/** the scene's pieces that go into the export (their root groups carry these names) */
export const EXPORT_NAMES = {
  restaurant: "restaurant",
  kitchen: "kitchen",
  machines: "machines",
  robot: "robot",
} as const;

/** the room lights (Light panel), by the names they have in the export: keep them when editing */
export const EDITOR_LIGHTS = {
  key: "key light",
  fill: "fill light",
  point: "point light",
  spot: "spot light",
} as const;
