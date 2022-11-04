import dynamic from "next/dynamic";

const pages = [
  { path: "/de/index", locale: "de" },
  { path: "/de/impressum", locale: "de" },
  { path: "/de/rechtliche-grundlagen", locale: "de" },

  { path: "/fr/index", locale: "fr" },
  { path: "/fr/impressum", locale: "fr" },
  { path: "/fr/cadre-juridique", locale: "fr" },

  { path: "/it/index", locale: "it" },
  { path: "/it/colophon", locale: "it" },
  { path: "/it/quadro-giuridico", locale: "it" },

  { path: "/en/index", locale: "en" },
  { path: "/en/imprint", locale: "en" },
  { path: "/en/legal-framework", locale: "en" },
];

export const staticPages = Object.fromEntries(
  pages.map(({ path, locale }) => {
    return [
      path,
      {
        locale,
        component: dynamic(() => import(`.${path}.mdx`)),
      },
    ];
  })
);
