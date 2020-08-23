
    function normalizeWhiteSpace(str) {
      if (str) {
        return str.trim().replace(/\s{2,}/g, ' ');
      } else {
        return str;
      }
    }
    
    function removeExtension(str) {
      return str.replace(/\.\w+$/g, '');
    }
    
    function fileNameToTitle(str) {
      return normalizeWhiteSpace(removeExtension(str).replace(/_/g, ' '));
    }

    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    function makeAssetLink(
      asset,
      { localeCode, fallbackCode, defaultLocaleCode }
    ) {
      const localizedFile = asset['fields']['file'][localeCode];
      const fallbackFile = fallbackCode ? asset['fields']['file'][fallbackCode] : null;
      const defaultFile = asset['fields']['file'][defaultLocaleCode];
      const file = localizedFile || fallbackFile || defaultFile;
    
      if (isObject(file) && file.url) {
        const title =
          asset['fields']['title'][localeCode] ||
          asset['fields']['title'][fallbackCode|| ''] ||
          asset['fields']['title'][defaultLocaleCode] ||
          fileNameToTitle(file.fileName);
    
        return {
          title,
          asset,
          url: file.url,
          // is normally localized and we should not warn about this file
          isLocalized: Boolean(localizedFile),
          // was fallback value used
          // if it was not localized normally, and we did not used a fallback
          // it means we used a default locale - we filter empty values
          isFallback: Boolean(fallbackFile),
          // todo: tranform using fromHostname
          asMarkdown: `![${title}](${file.url})`
        };
      } else {
        return null;
      }
    }

    export async function insertAssetLinks(assets, locales) {
      // check whether do we have some assets, which don't have
      // a version in this field's locale
      const otherLocales = assets.filter(asset => {
        return asset['fields']['file'][locales.localeCode];
      });
    
      const linksWithMeta = assets
        .map(asset => makeAssetLink(asset, locales))
        // remove empty links
        .filter(asset => asset !== null);
    
      // if there have values from fallback/default locales, we need to
      // provide user a warning so we show him modal
      if (otherLocales.length > 0) {
        const fallbackAssets = linksWithMeta
          // we don't want to warn about normally localized files
          .filter(({ isLocalized }) => !isLocalized)
          .map(({ title, isFallback, asset }) => {
            const code = isFallback ? locales.fallbackCode : locales.defaultLocaleCode;
            return {
              title,
              thumbnailUrl: asset.fields.file[code].url,
              thumbnailAltText: title,
              description: isFallback ? `Fallback locale (${code})` : `Default locale (${code})`,
              asset: asset
            };
          });
    
        return {
          fallbacks: fallbackAssets,
          links: linksWithMeta
        };
      }
      return {
        links: linksWithMeta
      };
    }

    export const insertAssetsWithConfirmation = async (assets, locales) => {
      const locale = locales.available[0]
      if (assets) {
        const { links, fallbacks } = await insertAssetLinks(assets, {
          localeCode: locale,
          defaultLocaleCode: locales.default,
          fallbackCode: locales.fallbacks[locale]
        });
        if (links && links.length > 0) {
          return links;
        }
      }
      return '';
    };