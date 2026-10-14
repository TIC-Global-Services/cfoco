import * as THREE from "three";
import { easeIn, easeInBack, easeInOutOvershoot } from "@/lib/home/scroll";

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
const SCENES_PAST_COPY = 2.1;
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
  position: new THREE.Vector3(0, 2.0387, 11.5793),
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

/** scroll progress over which the chicken fades in from nothing */
export const FADE_IN = 0.9;

/** raw → fried dissolve (0 = raw, 1 = fried) */
export const SWAP_FROM = 1.8;
export const SWAP_TO = 2.5;

/** `ease` (optional) shapes the segment that ends on this key */
export type Pose = { p: number; x: number; y: number; d: number; s: number; ease?: (t: number) => number };

/** bucket size on screen (1 = BUCKET_HEIGHT, the cup without its pile) */
const BUCKET_S = 0.82;
/** bucket base-centre height when it is "up": rim a little below centre, so the cup — logo included — is in frame and the pile clears the hovering chicken */
const BUCKET_UP_Y = -0.3 - BUCKET_HEIGHT * BUCKET_S;
/** low enough that even the top of the pile (≈0.4 × the cup above the rim) is out of frame */
const HIDDEN_Y = -2.4 - BUCKET_HEIGHT * BUCKET_S * 1.4;
/** the chicken starts rising after "The Final Crunch"… */
export const RISE_FROM = 3.35;
/** …reaches its hover spot; only then does the bucket start coming up */
export const HOVER_AT = 3.7;
/** bucket fully up */
const BUCKET_UP_AT = 4.25;
/** the chicken is flicked up (spin stops)… */
export const DROP_START = 4.3;
/** …and is out of the top of the frame: from here the bucket's baked drop plays */
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

/** chicken while it is free (before it is tossed out of frame) */
export const CHICKEN_KEYS: Pose[] = [
  { p: 0, x: 0, y: -0.05, d: 4.4, s: 1 },
  { p: 1.0, x: 0, y: 0.0, d: 4.0, s: 1.05 },
  // hold perfectly still while raw swaps to fried (SWAP_FROM..SWAP_TO)
  { p: SWAP_TO, x: 0, y: 0.0, d: 4.0, s: 1.05 },
  // …and keeps holding through "The Final Crunch" (section 3, text visible ≈2.6–3.4)
  { p: RISE_FROM, x: 0, y: 0.0, d: 4.0, s: 1.05 },
  // rises to hover above where the bucket mouth will be…
  { p: HOVER_AT, x: 0, y: 1.25, d: 4.0, s: 0.78 },
  // …and waits there while the bucket comes up from below
  { p: DROP_START, x: 0, y: 1.25, d: 4.0, s: 0.78 },
  // …dips to wind up…
  { p: 4.36, x: 0, y: 1.12, d: 4.0, s: 0.78 },
  // …and is flicked straight up out of frame; it comes back down as the bucket's falling piece
  { p: TOSS_OUT, x: 0, y: 4.2, d: 4.0, s: 0.78, ease: easeIn },
];

/** bucket base-centre. Rises from below the frame once the chicken is up, then sinks away for good. */
export const BUCKET_KEYS: Pose[] = [
  { p: HOVER_AT, x: 0, y: HIDDEN_Y, d: 4.0, s: BUCKET_S },
  { p: BUCKET_UP_AT, x: 0, y: BUCKET_UP_Y, d: 4.0, s: BUCKET_S, ease: easeInOutOvershoot }, // pops up, settles
  { p: 5.0, x: 0, y: BUCKET_UP_Y, d: 4.0, s: BUCKET_S },
  { p: 5.55, x: 0, y: HIDDEN_Y, d: 4.0, s: BUCKET_S, ease: (t) => easeInBack(t, 1.2) }, // little lift before it sinks
];

/** progress ranges where the hero is out of frame and can skip rendering */
export const HERO_HIDDEN: [number, number][] = [[5.6, Infinity]];

/** progress range over which the raw chicken's authored animation plays */
export const ANIM_FROM = 0.1;
export const ANIM_TO = 1.8;

// ---------------------------------------------------------------------------
// Machines rising from below the frame (RisingMachines). As the bucket sinks
// away an ordering kiosk comes up in the centre, then two more either side;
// once they sink, the vending machine rises alone in the centre.
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

/** standing on the floor */
const FLOOR_Y = -1.95;
const KIOSK_Y = FLOOR_Y;

export const KIOSK_URL = "/models/ordering_machine.glb";
/** kiosk height on screen, metres (the model is ≈1.9 m) */
export const KIOSK_HEIGHT = 2.5;
export const KIOSKS: RisingMachine[] = [
  // the centre one comes up as the bucket goes down (5.0 → 5.55)
  { x: 0, y: KIOSK_Y, d: 4.4, yaw: 0, from: 5.35, to: 5.9, outFrom: 7.45, outTo: 7.9 },
  // then left and right, a step behind it and angled in
  { x: -1.75, y: KIOSK_Y, d: 5.0, yaw: 0.38, from: 5.95, to: 6.45, outFrom: 7.4, outTo: 7.85 },
  { x: 1.75, y: KIOSK_Y, d: 5.0, yaw: -0.38, from: 6.1, to: 6.6, outFrom: 7.4, outTo: 7.85 },
];

export const VENDING_URL = "/models/vending.glb";
/** vending machine height on screen, metres (the model is ≈0.75 m; deep, so it stands a little further back) */
export const VENDING_HEIGHT = 2.3;
/** turns the model's front to the lens */
export const VENDING_FACING = 0;
export const VENDING: RisingMachine[] = [
  // one, in the centre, as the kiosks sink (7.4 → 7.9)
  { x: 0, y: FLOOR_Y, d: 5.4, yaw: 0, from: 7.85, to: 8.4, outFrom: 8.55, outTo: 8.95 },
];

// ---------------------------------------------------------------------------
// Kitchen (kitchen_layer.glb, cut from the kitchen model and moved into the
// room's frame — see models-src/extract-kitchen.mjs), where it was built:
// just in front of the restaurant's open side, right in the main view. So it
// only shows for its step: it fades in, the camera leaves its locked spot to
// look into the kitchen alone and comes back, then it fades out.
// ---------------------------------------------------------------------------

export const KITCHEN = {
  /** the kitchen fades in where it stands, camera still on its spot… */
  showFrom: 8.95,
  showTo: 9.15,
  /** …the camera moves into it… */
  outFrom: 9.15,
  outTo: 9.7,
  /** …comes back to its spot… */
  backFrom: 9.95,
  backTo: 10.35,
  /** …and only then does the kitchen fade out */
  hideFrom: 10.35,
  hideTo: 10.48,
  /** inside its open front (x ≈ 0…8, z ≈ 8…15), as far back as the floor allows, facing the counter and fryers */
  eye: new THREE.Vector3(4.3, 3.0, 14.8),
  target: new THREE.Vector3(4.9, 1.2, 9.4),
  /** lens on the kitchen view (landscape): wider, so the whole line-up fits */
  fov: 62,
};

// ---------------------------------------------------------------------------
// The meal (Figma 1467, "The Journey Ends In Your Hands"): once the camera is
// back from the kitchen, the white bucket rises in the centre, then the fries
// in front of it on the left and a can of coke beside them. Hovering the fries
// plays their bounce (fries.glb's clips). Camera-relative, like the hero.
// ---------------------------------------------------------------------------

export type MealItem = {
  url: string;
  /** on-screen height, metres */
  height: number;
  x: number;
  d: number;
  /** turns the model's front to the lens, radians */
  yaw: number;
  from: number;
  to: number;
};

export const MEAL = {
  /** everything sinks together before the outro */
  outFrom: 11.15,
  outTo: 11.45,
  items: [
    { url: "/models/chicken_bucket_white.glb", height: 3.1, x: 0.4, d: 5.0, yaw: BUCKET_YAW, from: 10.45, to: 10.8 },
    { url: "/models/fries.glb", height: 1.3, x: -0.8, d: 4.4, yaw: -Math.PI / 2, from: 10.6, to: 10.95 },
    { url: "/models/coke.glb", height: 1.4, x: -1.7, d: 4.7, yaw: -1.2, from: 10.7, to: 11.05 },
  ] as MealItem[],
};

/** the meal as RisingMachines sets, one per model (stable references: they key the models' setup) */
export const MEAL_MACHINES: RisingMachine[][] = MEAL.items.map((m) => [
  { x: m.x, y: FLOOR_Y, d: m.d, yaw: m.yaw, from: m.from, to: m.to, outFrom: MEAL.outFrom, outTo: MEAL.outTo },
]);

// ---------------------------------------------------------------------------
// The serving robot ("Served By The Future"): rises alone in the centre once
// the meal has gone, same as the vending machine, and sinks as the outro starts.
// ---------------------------------------------------------------------------

export const ROBOT_URL = "/models/serve_robot.glb";
/** on-screen height, metres (the model is ≈1.9 m) */
export const ROBOT_HEIGHT = 2.6;
/** turns the model's front to the lens */
export const ROBOT_FACING = 0;
export const ROBOT: RisingMachine[] = [
  { x: 0, y: FLOOR_Y, d: 4.6, yaw: 0, from: 11.45, to: 12.0, outFrom: 12.2, outTo: 12.6 },
];

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
