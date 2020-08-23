import  { insertAssetsWithConfirmation } from './asset';

$(document).ready(function () {
  window.contentfulExtension.init(function (extension) {
    extension.window.startAutoResizer();

    var existingValue = extension.field.getValue();

    const AddNewAssetButton = (context) =>{
      const ui = $.summernote.ui;
      const action = async() => {
        if (!extension) {
          return;
        }
        const { entity: asset } = (await extension.navigator.openNewAsset({
             slideIn: { waitForClose: true }
           })); 
        // eslint-disable-line @typescript-eslint/no-explicit-any
        const markdownLinks = await insertAssetsWithConfirmation([asset], extension.locales);
        markdownLinks.forEach((link) => {
          context.invoke('editor.insertImage', link.url, function ($image) {
            $image.attr('data-contentful-id', link.asset.sys.id)
          });
        })
      }
      // create button
      const button = ui.button({
        contents: '<i class="fa fa-child"/> New',
        tooltip: 'Insert new Media',
        click: action,
      });
      return button.render()
    }


    const InsertAssetButton = (context) => {
      const ui = $.summernote.ui;
      const action = async() => {
        if (!extension) {
          return;
        }
        const assets = (await extension.dialogs.selectMultipleAssets());
        const markdownLinks = await insertAssetsWithConfirmation(assets, extension.locales);
        markdownLinks.forEach((link) => {
          context.invoke('editor.insertImage', link.url, function ($image) {
            $image.attr('data-contentful-id', link.asset.sys.id)
          });
        })
      }
      // create button
      const button = ui.button({
        contents: '<i class="fa fa-child"/> Img',
        tooltip: 'Insert exist Media',
        click: action,
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
        ["style", ["style", "bold", "italic", "underline","strikethrough", "color", "clear"]],
        // ["font", ["strikethrough"]],
        //    ["fontsize", ["fontsize"]],
        ["insert", ["link", "table", 'asset', 'add']],
        // ["color", ["color"]],
        ["para", ["ul", "ol", "paragraph"]],
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
        asset: InsertAssetButton,
        add: AddNewAssetButton
      },
      tabDisable: true
    });

  });
});
