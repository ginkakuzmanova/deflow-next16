import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { BADGE_CRITERIA } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDeviconClassName(techName: string) {
  const normalizedTech = techName.replace(/[ .]/g, "").toLowerCase();

  // Dictionary mapping possible technology names to Devicon class names
  const techMap: { [key: string]: string } = {
    // --- JavaScript / TypeScript ---
    javascript: "devicon-javascript-plain",
    js: "devicon-javascript-plain",
    typescript: "devicon-typescript-plain",
    ts: "devicon-typescript-plain",

    // --- Frontend Frameworks / Libraries ---
    react: "devicon-react-original",
    reactjs: "devicon-react-original",
    nextjs: "devicon-nextjs-plain",
    next: "devicon-nextjs-plain",
    angular: "devicon-angularjs-plain",
    angularjs: "devicon-angularjs-plain",
    vue: "devicon-vuejs-plain",
    vuejs: "devicon-vuejs-plain",
    nuxt: "devicon-nuxtjs-plain",
    nuxtjs: "devicon-nuxtjs-plain",
    svelte: "devicon-svelte-plain",
    sveltekit: "devicon-svelte-plain",

    // --- Styling ---
    css: "devicon-css3-plain",
    css3: "devicon-css3-plain",
    html: "devicon-html5-plain",
    html5: "devicon-html5-plain",
    sass: "devicon-sass-original",
    scss: "devicon-sass-original",
    less: "devicon-less-plain-wordmark",
    tailwind: "devicon-tailwindcss-original",
    tailwindcss: "devicon-tailwindcss-original",
    bootstrap: "devicon-bootstrap-plain",
    materialui: "devicon-materialui-plain",
    mui: "devicon-materialui-plain",
    styledcomponents: "devicon-styledcomponents-plain",
    styled: "devicon-styledcomponents-plain",

    // --- Backend / Runtime ---
    nodejs: "devicon-nodejs-plain",
    node: "devicon-nodejs-plain",
    deno: "devicon-denojs-original",
    bun: "devicon-bun-plain",
    express: "devicon-express-original",
    nestjs: "devicon-nestjs-plain",
    graphql: "devicon-graphql-plain",
    apollo: "devicon-apollographql-plain",
    spring: "devicon-spring-original",

    // --- Languages ---
    python: "devicon-python-plain",
    java: "devicon-java-plain",
    kotlin: "devicon-kotlin-plain",
    csharp: "devicon-csharp-plain",
    "c#": "devicon-csharp-plain",
    golang: "devicon-go-plain",
    go: "devicon-go-plain",
    php: "devicon-php-plain",
    ruby: "devicon-ruby-plain",
    rust: "devicon-rust-plain",
    swift: "devicon-swift-plain",
    dart: "devicon-dart-plain",
    c: "devicon-c-plain",
    cpp: "devicon-cplusplus-plain",
    "c++": "devicon-cplusplus-plain",

    // --- Databases ---
    mysql: "devicon-mysql-plain",
    postgresql: "devicon-postgresql-plain",
    postgres: "devicon-postgresql-plain",
    mongodb: "devicon-mongodb-plain",
    mongo: "devicon-mongodb-plain",
    redis: "devicon-redis-plain",
    sqlite: "devicon-sqlite-plain",
    firebase: "devicon-firebase-plain",
    supabase: "devicon-supabase-plain",

    // --- DevOps / Cloud ---
    docker: "devicon-docker-plain",
    kubernetes: "devicon-kubernetes-plain",
    k8s: "devicon-kubernetes-plain",
    nginx: "devicon-nginx-original",
    linux: "devicon-linux-plain",
    github: "devicon-github-original",
    gitlab: "devicon-gitlab-plain",
    bitbucket: "devicon-bitbucket-original",
    githubactions: "devicon-githubactions-plain",
    aws: "devicon-amazonwebservices-plain",
    gcp: "devicon-googlecloud-plain",
    googlecloud: "devicon-googlecloud-plain",
    azure: "devicon-azure-plain",

    // --- Tooling / Build ---
    git: "devicon-git-plain",
    vite: "devicon-vitejs-plain",
    webpack: "devicon-webpack-plain",
    babel: "devicon-babel-plain",
    npm: "devicon-npm-original-wordmark",
    yarn: "devicon-yarn-plain",
    pnpm: "devicon-pnpm-plain",
    jest: "devicon-jest-plain",
    vitest: "devicon-vitest-plain",
    cypress: "devicon-cypressio-plain",
    playwright: "devicon-playwright-plain",
    eslint: "devicon-eslint-plain",
    prettier: "devicon-prettier-plain",

    // --- CMS / Platforms ---
    wordpress: "devicon-wordpress-plain",
    shopify: "devicon-shopify-plain",
    strapi: "devicon-strapi-plain",
    contentful: "devicon-contentful-plain",

    // --- Design / Collaboration ---
    figma: "devicon-figma-plain",
    jira: "devicon-jira-plain",
    slack: "devicon-slack-plain",

    // --- Meta / fallback ---
    devicon: "devicon-devicon-plain",
  };

  return `${techMap[normalizedTech] || "devicon-devicon-plain"} colored`;
}

export function getTechDescription(techName: string): string {
  const normalizedTech = techName.replace(/[ .]/g, "").toLowerCase();

  // Mapping technology names to descriptions
  const techDescriptionMap: { [key: string]: string } = {
    javascript: "JavaScript is a powerful language for building dynamic, interactive, and modern web applications.",
    typescript:
      "TypeScript adds strong typing to JavaScript, making it great for scalable and maintainable applications.",
    react: "React is a popular library for building fast, component-based user interfaces and web applications.",
    nextjs: "Next.js is a React framework for building fast, SEO-friendly, and production-grade web applications.",
    nodejs: "Node.js is a runtime for building fast and scalable server-side applications using JavaScript.",
    python: "Python is a beginner-friendly language known for its versatility and simplicity in various fields.",
    java: "Java is a versatile, cross-platform language widely used in enterprise and Android development.",
    "c++": "C++ is a high-performance language ideal for system programming, games, and large-scale applications.",
    git: "Git is a version control system that helps developers track changes and collaborate on code efficiently.",
    docker: "Docker simplifies app deployment by containerizing environments, ensuring consistency across platforms.",
    mongodb: "MongoDB is a flexible NoSQL database ideal for handling unstructured data and scalable applications.",
    mysql:
      "MySQL is a popular open-source relational database management system known for its stability and performance.",
    postgresql: "PostgreSQL is a powerful open-source SQL database known for its scalability and robustness.",
    aws: "Amazon Web Services (AWS) is a cloud computing platform that offers a wide range of services for building, deploying, and managing web and mobile applications.",
  };

  return (
    techDescriptionMap[normalizedTech] ||
    `${techName} is a technology or tool widely used in software development, providing valuable features and capabilities.`
  );
}

export function formatNumber(number: number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toString();
  }
}

export const getTimeStamp = (createdAt: Date): string => {
  const date = new Date(createdAt);
  const now = new Date();

  const diffMilliseconds = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMilliseconds / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays} days ago`;
};

export function assignBadges(params: {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}) {
  const badgeCounts: Badges = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  const { criteria } = params;

  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level) => {
      if (count >= badgeLevels[level as keyof typeof badgeLevels]) {
        badgeCounts[level as keyof Badges] += 1;
      }
    });
  });

  return badgeCounts;
}

export function processJobTitle(title: string | undefined | null): string {
  // Check if title is undefined or null
  if (title === undefined || title === null) {
    return "No Job Title";
  }

  // Split the title into words
  const words = title.split(" ");

  // Filter out undefined or null and other unwanted words
  const validWords = words.filter((word) => {
    return word !== undefined && word !== null && word.toLowerCase() !== "undefined" && word.toLowerCase() !== "null";
  });

  // If no valid words are left, return the general title
  if (validWords.length === 0) {
    return "No Job Title";
  }

  // Join the valid words to create the processed title
  const processedTitle = validWords.join(" ");

  return processedTitle;
}
