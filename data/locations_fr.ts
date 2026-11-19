import { LocationData, locationsData } from "./locations";

export const locationsDataFr: LocationData[] = [
  // ==========================================================================
  // LOCATION 1: BORDEAUX LAC
  // ==========================================================================
  {
    ...locationsData[0],
    badge: "Bordeaux Lac",
    hero: {
      ...locationsData[0].hero,
      locationLabel: "Bordeaux Lac, France",
      subheading: "CFC Savoureux",
      heading: "Bordeauxlac",
      description: "Situé près du lac à Bordeaux. Poulet frit croustillant, portions généreuses et service rapide et chaleureux pour les passionnés de croustillant.",
    },
    experience: {
      ...locationsData[0].experience,
      signatureDish: {
        badge: "Plat Signature",
        title: "La Box de Tenders Originale.",
        subtitle: "La recette qui a déclenché l'obsession",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Lun–Jeu 11h00–23h00",
        weekend: "Ven–Sam 11h00–01h00",
        sunday: "Dim 12h00–22h00",
      },
    },
    virtualTour: {
      ...locationsData[0].virtualTour,
      heading: "Plongez dans le croustillant",
      buttonText: "Faites une visite virtuelle",
    },
    tagline: {
      prefix: "Le croustillant au bord du lac.",
      highlight: "Bordeaux Lac.",
      description: "Situé près du lac à Bordeaux. Poulet frit croustillant, portions généreuses et service chaleureux.",
    },
    openingHours: {
      weekday: "Lun–Jeu 11h00–23h00",
      weekend: "Ven–Sam 11h00–01h00",
      sunday: "Dim 12h00–22h00",
    },
    signatureDish: {
      badge: "Plat Signature",
      title: "La Box de Tenders Originale.",
      subtitle: "La recette qui a déclenché l'obsession",
    },
    tourTitle: "Plongez dans le croustillant",
    tourSubtitle: "Faites une visite virtuelle",
  },

  // ==========================================================================
  // LOCATION 2: BORDEAUX (CENTRE / COURS DE LA MARNE)
  // ==========================================================================
  {
    ...locationsData[1],
    badge: "Restaurant Phare",
    hero: {
      ...locationsData[1].hero,
      locationLabel: "Bordeaux Centre, France",
      subheading: "CFC Savoureux",
      heading: "Bordeaux",
      description: "En plein cœur de Bordeaux. Là où tout a commencé en 2011, et où les files d'attente se forment toujours pour notre croustillant signature incomparable.",
    },
    experience: {
      ...locationsData[1].experience,
      signatureDish: {
        badge: "Plat Signature",
        title: "La Box de Tenders Originale.",
        subtitle: "La recette qui a déclenché l'obsession",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Lun–Jeu 11h00–23h00",
        weekend: "Ven–Sam 11h00–01h00",
        sunday: "Dim 12h00–22h00",
      },
    },
    virtualTour: {
      ...locationsData[1].virtualTour,
      heading: "Plongez dans le croustillant",
      buttonText: "Faites une visite virtuelle",
    },
    tagline: {
      prefix: "Vivant & Audacieux.",
      highlight: "Notre Original.",
      description: "En plein cœur de Bordeaux. Là où tout a commencé en 2011, et où les passionnés se retrouvent chaque jour.",
    },
    openingHours: {
      weekday: "Lun–Jeu 11h00–23h00",
      weekend: "Ven–Sam 11h00–01h00",
      sunday: "Dim 12h00–22h00",
    },
    signatureDish: {
      badge: "Plat Signature",
      title: "La Box de Tenders Originale.",
      subtitle: "La recette qui a déclenché l'obsession",
    },
    tourTitle: "Plongez dans le croustillant",
    tourSubtitle: "Faites une visite virtuelle",
  },

  // ==========================================================================
  // LOCATION 3: BOUSCAT (LE BOUSCAT)
  // ==========================================================================
  {
    ...locationsData[2],
    badge: "Espace Gourmand",
    hero: {
      ...locationsData[2].hero,
      locationLabel: "Le Bouscat, France",
      subheading: "CFC Savoureux",
      heading: "Bouscat",
      description: "Niché au Bouscat. Ambiance moderne, lumière ambrée chaleureuse et un croustillant sans compromis tout juste sorti des friteuses.",
    },
    experience: {
      ...locationsData[2].experience,
      signatureDish: {
        badge: "Plat Signature",
        title: "Sandwich Beurre & Miel Épicé.",
        subtitle: "Nappé de notre glaçage signature sur brioche toastée",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Lun–Jeu 11h30–23h00",
        weekend: "Ven–Sam 11h30–00h30",
        sunday: "Dim 12h00–22h30",
      },
    },
    virtualTour: {
      ...locationsData[2].virtualTour,
      heading: "Plongez dans le croustillant",
      buttonText: "Faites une visite virtuelle",
    },
    tagline: {
      prefix: "Gourmand & Chaleureux.",
      highlight: "Ambiance Avenue.",
      description: "Niché au Bouscat. Ambiance moderne, lumière ambrée chaleureuse et croustillant sans compromis.",
    },
    openingHours: {
      weekday: "Lun–Jeu 11h30–23h00",
      weekend: "Ven–Sam 11h30–00h30",
      sunday: "Dim 12h00–22h30",
    },
    signatureDish: {
      badge: "Plat Signature",
      title: "Sandwich Beurre & Miel Épicé.",
      subtitle: "Nappé de notre glaçage signature sur brioche toastée",
    },
    tourTitle: "Plongez dans le croustillant",
    tourSubtitle: "Faites une visite virtuelle",
  },

  // ==========================================================================
  // LOCATION 4: TALENCE (UNIVERSITY)
  // ==========================================================================
  {
    ...locationsData[3],
    badge: "Campus Étudiant",
    hero: {
      ...locationsData[3].hero,
      locationLabel: "Talence, France",
      subheading: "CFC Savoureux",
      heading: "Talence",
      description: "À deux pas du campus universitaire. Formules étudiants, comptoirs de recharge et ambiance croustillante non-stop.",
    },
    experience: {
      ...locationsData[3].experience,
      signatureDish: {
        badge: "Plat Signature",
        title: "Le Quad Stack Burger.",
        subtitle: "Quatre filets croustillants avec double pepper jack",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Lun–Jeu 11h00–23h00",
        weekend: "Ven–Sam 11h00–02h00",
        sunday: "Dim 12h00–23h00",
      },
    },
    virtualTour: {
      ...locationsData[3].virtualTour,
      heading: "Plongez dans le croustillant",
      buttonText: "Faites une visite virtuelle",
    },
    tagline: {
      prefix: "Énergie Campus.",
      highlight: "Hub Étudiant.",
      description: "À deux pas du campus universitaire. Formules étudiants et ambiance croustillante non-stop.",
    },
    openingHours: {
      weekday: "Lun–Jeu 11h00–23h00",
      weekend: "Ven–Sam 11h00–02h00",
      sunday: "Dim 12h00–23h00",
    },
    signatureDish: {
      badge: "Plat Signature",
      title: "Le Quad Stack Burger.",
      subtitle: "Quatre filets croustillants avec double pepper jack",
    },
    tourTitle: "Plongez dans le croustillant",
    tourSubtitle: "Faites une visite virtuelle",
  },
];

export function getLocationBySlugFr(slug: string): LocationData | undefined {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return locationsDataFr.find(
    (loc) =>
      loc.slug === slug ||
      loc.slug.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
      loc.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
      (slug === "cours-de-la-marne" && loc.slug === "bordeaux") ||
      (slug === "lormont" && loc.slug === "bordeauxlac") ||
      (slug === "le-bouscat" && loc.slug === "bouscat")
  );
}
