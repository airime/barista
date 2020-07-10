/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { join, dirname } from 'path';

import {
  BaSinglePageMeta,
  BaPageLayoutType,
} from '@dynatrace/shared/design-system/interfaces';
import { environment } from '@environments/barista-environment';
import { isPublicBuild } from '@dynatrace/shared/node';

import {
  BaPageBuilder,
  BaPageBuildResult,
  BaPageTransformer,
  BaStrapiPage,
  BaStrapiContentType,
  NextStrapiPage,
  NextContentType,
  BaStrapiCategory,
} from '../types';

import { fetchContentList } from '@dynatrace/shared/data-access-strapi';
import { slugify } from '../utils/slugify';

import {
  markdownToHtmlTransformer,
  transformPage,
  headingIdTransformer,
  copyHeadlineTransformer,
  relativeUrlTransformer,
  tableOfContentGenerator,
} from '../transform';
import { mkdirSync, promises as fs } from 'fs';

const TRANSFORMERS: BaPageTransformer[] = [
  markdownToHtmlTransformer,
  headingIdTransformer,
  copyHeadlineTransformer,
  relativeUrlTransformer,
  tableOfContentGenerator,
];

/** Page-builder for Strapi CMS pages. */
export const strapiBuilder: BaPageBuilder = async (
  globalTransformers: BaPageTransformer[],
  next: boolean = false,
) => {
  // Return here if no endpoint is given.
  if (!environment.strapiEndpoint) {
    console.log('No Strapi endpoint given.');
    return [];
  }

  let pagesData = next
    ? await fetchContentList<NextStrapiPage>(
        NextContentType.NextPages,
        { publicContent: false },
        environment.strapiEndpoint,
      )
    : await fetchContentList<BaStrapiPage>(
        BaStrapiContentType.Pages,
        { publicContent: isPublicBuild() },
        environment.strapiEndpoint,
      );

  let categoriesData: BaStrapiCategory[] = [];

  categoriesData = await fetchContentList<BaStrapiCategory>(
    BaStrapiContentType.Categories,
    { publicContent: isPublicBuild() },
    environment.strapiEndpoint,
  );

  categoriesData = next
    ? categoriesData.filter((data) => data.nextpages.length > 0)
    : categoriesData.filter((data) => data.pages.length > 0);

  // Filter pages with draft set to null or false
  pagesData = pagesData.filter((page) => !page.draft);

  const transformed: BaPageBuildResult[] = [];

  for (const page of pagesData) {
    const pageDir = page.category ? page.category.title.toLowerCase() : '/';
    const relativeOutFile = page.slug
      ? join(pageDir, `${page.slug}.json`)
      : join(pageDir, `${slugify(page.title)}.json`);
    const pageContent = await transformPage(
      {
        ...strapiMetaData(page),
        content: page.content,
      },
      [...TRANSFORMERS, ...globalTransformers],
    );
    transformed.push({ pageContent, relativeOutFile });
  }

  const categories = joinCategories(categoriesData);
  const distDir = next ? 'dist/next-data' : 'dist/barista-data';
  writeCategoriesJson(distDir, categories);

  return transformed;
};

function joinCategories(categoriesData: BaStrapiCategory[]): string[] {
  let categoriesJson: string[] = [];
  for (const category of categoriesData) {
    categoriesJson.push(category.title);
  }
  return categoriesJson;
}

function writeCategoriesJson(distDir: string, categories: string[]): void {
  console.log(distDir);
  const outFile = join(distDir, 'categories.json');
  console.log(JSON.stringify(categories));

  // Creating folder path if it does not exist
  mkdirSync(dirname(outFile), { recursive: true });

  // Write file with page content to disc.
  // tslint:disable-next-line: no-magic-numbers
  fs.writeFile(outFile, JSON.stringify(categories), {
    flag: 'w', // "w" -> Create file if it does not exist
    encoding: 'utf8',
  });
}

/**
 * Transform page metadata fetched from strapi
 * according to BaSinglePageMeta structure.
 */
function strapiMetaData(page: BaStrapiPage): BaSinglePageMeta {
  const metaData: BaSinglePageMeta = {
    title: page.title,
    layout: BaPageLayoutType.Default,
    category: page.category ? page.category.title : '',
  };

  // Set description
  if (page.description) {
    metaData.description = page.description;
  }

  // Set tags
  const tags = page.tags.map((tag) => tag.name) || [];
  if (tags.length > 0) {
    metaData.tags = tags;
  }

  // Set UX Wiki page link (only for internal Barista)
  if (!isPublicBuild() && page.wiki) {
    metaData.wiki = page.wiki;
  }

  // Set contributors
  if (page.contributors && page.contributors.length > 0) {
    metaData.contributors = {};
    const uxSupport = page.contributors
      .filter((c) => !c.developer)
      .map((c) => ({
        name: c.name,
        githubuser: c.githubuser,
      }));
    const devSupport = page.contributors
      .filter((c) => c.developer)
      .map((c) => ({
        name: c.name,
        githubuser: c.githubuser,
      }));

    if (uxSupport.length > 0) {
      metaData.contributors!.ux = uxSupport;
    }

    if (devSupport.length > 0) {
      metaData.contributors!.dev = devSupport;
    }
  }

  if (page.toc !== null) {
    metaData.toc = page.toc;
  }

  return metaData;
}
