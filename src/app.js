$(document).ready(function () {
  window.contentfulExtension.init(function (extension) {
    extension.window.startAutoResizer();

    var existingValue = extension.field.getValue();
    const insertAssetsWithConfirmation = async (assets) => {
     if (assets) {
       const { links, fallbacks } = await insertAssetLinks(assets, {
         localeCode: locale,
         defaultLocaleCode: sdk.locales.default,
         fallbackCode: sdk.locales.fallbacks[locale]
       });
       if (links && links.length > 0) {
         if (fallbacks) {
           const insertAnyway = await openConfirmInsertAsset(sdk.dialogs, {
             locale: locale,
             assets: fallbacks
           });
           if (!insertAnyway) {
             throw Error('User decided to not use fallbacks');
           }
         }
         return links.map(link => link.asMarkdown).join('\n\n');
       }
     }
     return '';
   };

    const InsertAssetButton = (coonntext) => {
     const ui = $.summernote.ui;

     // create button
     const button = ui.button({
       contents: '<i class="fa fa-child"/> Hello',
       tooltip: 'insertAsset',
       click: function () {
          const { entity: asset } = (await extension.navigator.openNewAsset({
               slideIn: { waitForClose: true }
             })); // eslint-disable-line @typescript-eslint/no-explicit-any
     
             const markdownLinks = await insertAssetsWithConfirmation([asset]);
         // invoke insertText method with 'hello' on editor module.
         context.invoke('editor.insertText', 'hello');
       }
     });
     return button.render()
    }
    $(".summernote").html(existingValue);

    $(".summernote").summernote({
      height: 300, // set editor height
      minHeight: null, // set minimum height of editor
      maxHeight: null, // set maximum height of editor
      focus: true,
      toolbar: [
        ["style", ["bold", "italic", "underline", "clear"]],
        ["font", ["strikethrough"]],
        //    ["fontsize", ["fontsize"]],
        ["insert", ["link", "table"]],
        ["color", ["color"]],
        ["para", ["ul", "ol", "paragraph", "style"]],
        //    ["height", ["height"]],
        ["code", ["codeview"]],
      ],
      styleTags: ["p", "pre", "h1", "h2", "h3", "h4", "h5"],
      popover: {
        table: [
          ["add", ["addRowDown", "addRowUp", "addColLeft", "addColRight"]],
          ["delete", ["deleteRow", "deleteCol", "deleteTable"]],
        ],
        link: [["link", ["linkDialogShow", "unlink"]]],
      },
      callbacks: {
        onInit: function () {
          console.log("Summernote is launched");
        },
        onChange: function (contents, $editable) {
          var markupStr = $(this).summernote("code");
          extension.field.setValue(markupStr);
        },
        onBlur: function () {
          var markupStr = $(this).summernote("code");
          extension.field.setValue(markupStr);
        },
      },
      buttons: {
          asset: InsertAssetButton
        }
    });
  });
});
