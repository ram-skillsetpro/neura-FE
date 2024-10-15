/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved. For licensing,
 *   see LICENSE.md.
 */

import Comments from "@ckeditor/ckeditor5-comments/src/comments";
import BaseEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import TrackChanges from "@ckeditor/ckeditor5-track-changes/src/trackchanges";

import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import CKBoxPlugin from "@ckeditor/ckeditor5-ckbox/src/ckbox";
import CloudServices from "@ckeditor/ckeditor5-cloud-services/src/cloudservices";
import { Command, Plugin } from "@ckeditor/ckeditor5-core";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import { Font } from "@ckeditor/ckeditor5-font";
import FontFamily from "@ckeditor/ckeditor5-font/src/fontfamily";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Highlight from "@ckeditor/ckeditor5-highlight/src/highlight";
import { HorizontalLine } from "@ckeditor/ckeditor5-horizontal-line";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
import PictureEditing from "@ckeditor/ckeditor5-image/src/pictureediting";
import { Indent, IndentBlock } from "@ckeditor/ckeditor5-indent";
import Link from "@ckeditor/ckeditor5-link/src/link";
import List from "@ckeditor/ckeditor5-list/src/list";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed";
import { PageBreak } from "@ckeditor/ckeditor5-page-break";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import RemoveFormat from "@ckeditor/ckeditor5-remove-format/src/removeformat";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableCellProperties from "@ckeditor/ckeditor5-table/src/tablecellproperties";
import TableProperties from "@ckeditor/ckeditor5-table/src/tableproperties";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import { ViewModel, addListToDropdown, createDropdown } from "@ckeditor/ckeditor5-ui";
import { Base64UploadAdapter } from "@ckeditor/ckeditor5-upload";
import { Collection } from "@ckeditor/ckeditor5-utils";
import {
  Widget,
  toWidget,
  viewToModelPositionOutsideModelElement,
} from "@ckeditor/ckeditor5-widget";

// import * as CKBox from "ckbox";
// import "ckbox/dist/styles/ckbox.css";
class Placeholder extends Plugin {
  static get requires() {
    return [PlaceholderEditing, PlaceholderUI];
  }
}

class PlaceholderCommand extends Command {
  execute({ value }) {
    const editor = this.editor;
    const selection = editor.model.document.selection;

    editor.model.change((writer) => {
      // Create a <placeholder> element with the "name" attribute (and all the selection attributes)...
      const placeholder = writer.createElement("placeholder", {
        ...Object.fromEntries(selection.getAttributes()),
        name: value,
      });

      // ... and insert it into the document. Put the selection on the inserted element.
      editor.model.insertObject(placeholder, null, null, { setSelection: "on" });
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;

    const isAllowed = model.schema.checkChild(selection.focus.parent, "placeholder");

    this.isEnabled = isAllowed;
  }
}

class PlaceholderUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    const placeholderNames = editor.config.get("placeholderConfig.types");

    // The "placeholder" dropdown must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add("placeholder", (locale) => {
      const dropdownView = createDropdown(locale);
      // Populate the list in the dropdown with items.
      if (Array.isArray(placeholderNames)) {
        addListToDropdown(dropdownView, getDropdownItemsDefinitions(placeholderNames));
      } else {
        placeholderNames(dropdownView, addListToDropdown, getDropdownItemsDefinitions);
        // placeholderNames()
        //   .then(() => {
        //     console.log("placeholder set");
        //     // addListToDropdown(dropdownView, getDropdownItemsDefinitions(items));
        //     // The "placeholder" dropdown must be registered among the UI components of the editor
        //     // to be displayed in the toolbar.
        //   })
        //   .catch((error) => {
        //     console.log("Error", error);
        //   });
      }

      dropdownView.class = "placeholder-custom-container";

      dropdownView.buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t("Placeholder"),
        tooltip: true,
        withText: true,
      });
      // Disable the placeholder button when the command is disabled.
      const command = editor.commands.get("placeholder");
      dropdownView.bind("isEnabled").to(command);
      // Execute the command when the dropdown item is clicked (executed).
      this.listenTo(dropdownView, "execute", (evt) => {
        editor.execute("placeholder", { value: evt.source.commandParam });
        editor.editing.view.focus();
      });
      return dropdownView;
    });
  }
}

function getDropdownItemsDefinitions(placeholderNames) {
  const itemDefinitions = new Collection();

  for (const obj of placeholderNames) {
    const { label, key } = obj;
    const definition = {
      type: "button",
      model: new ViewModel({
        commandParam: key,
        label,
        withText: true,
      }),
    };

    // Add the item definition to the collection.
    itemDefinitions.add(definition);
  }

  return itemDefinitions;
}

class PlaceholderEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add("placeholder", new PlaceholderCommand(this.editor));

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, (viewElement) =>
        viewElement.hasClass("placeholder"),
      ),
    );
    this.editor.config.define("placeholderConfig", {
      types: [],
    });
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("placeholder", {
      // Behaves like a self-contained inline object (e.g. an inline image)
      // allowed in places where $text is allowed (e.g. in paragraphs).
      // The inline widget can have the same attributes as text (for example linkHref, bold).
      inheritAllFrom: "$inlineObject",

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ["name", "placeholderid"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: ["placeholder"],
      },
      model: (viewElement, { writer: modelWriter }) => {
        // Extract the "name" from "{name}".
        // const name = viewElement.getChild(0).data.slice(1, -1);
        const classList = viewElement.getClassNames();
        const newList = Array.from(classList);
        const name = (newList[1] || "").replace("placeholder-", "");
        return modelWriter.createElement("placeholder", { name });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        // Enable widget handling on a placeholder element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem, { writer: viewWriter }) => {
        return createPlaceholderView(modelItem, viewWriter);
      },
    });

    function createPlaceholderView(modelItem, viewWriter) {
      const name = modelItem.getAttribute("name");
      const inputEl = document.querySelector(`.placeholder-input-${name}`);
      const externalDataPreviewElement = viewWriter.createRawElement(
        "span",
        null,
        function (domElement) {
          domElement.classList.add(`placeholder`);
          domElement.classList.add(`placeholder-${name}`);
          domElement.classList.add(`custom-placeholder`);
          domElement.textContent = inputEl && inputEl.value !== "" ? inputEl.value : `{${name}}`;
        },
      );

      const externalWidgetContainer = viewWriter.createContainerElement(
        "span",
        null,
        externalDataPreviewElement,
      );

      return externalWidgetContainer;
    }
  }
}

class CustomCKEditor extends BaseEditor {}

CustomCKEditor.builtinPlugins = [
  Placeholder,
  HorizontalLine,
  Base64UploadAdapter,
  PageBreak,
  Indent,
  IndentBlock,
  Font,
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  CKBoxPlugin,
  PictureEditing,
  CloudServices,
  Essentials,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  Strikethrough,
  Table,
  TableToolbar,
  TableCellProperties,
  TableProperties,
  Underline,
  Comments,
  TrackChanges,
];

CustomCKEditor.defaultConfig = {
  // CKBox configuration is added only for the CKBox integration. This configuration should not be used in
  // a production environment. It is not needed for the track changes feature. See https://ckeditor.com/ckbox/
  // ckbox: {
  //   tokenUrl: "https://api.ckbox.io/token/demo",
  // },
  toolbar: [
    "placeholder",
    "horizontalLine",
    "pageBreak",
    "heading",
    "|",
    "fontsize",
    "fontfamily",
    "fontColor",
    "fontBackgroundColor",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "removeFormat",
    "highlight",
    "|",
    "numberedList",
    "bulletedList",
    "outdent",
    "indent",
    "|",
    "undo",
    "redo",
    "|",
    "trackChanges",
    "comment",
    "commentsArchive",
    "|",
    // "ckbox",
    "imageUpload",
    "link",
    "blockquote",
    "insertTable",
    "mediaEmbed",
  ],
  placeholderConfig: {
    types: [],
  },
  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
      "|",
      "comment",
    ],
  },
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
    ],
    tableToolbar: ["comment"],
  },
  mediaEmbed: {
    toolbar: ["comment"],
  },
  comments: {
    editorConfig: {
      extraPlugins: [Bold, Italic, Underline, List, Autoformat],
    },
  },
  indentBlock: {
    offset: 1,
    unit: "em",
  },
};

export default {
  CustomCKEditor,
  // CKBox,
};
