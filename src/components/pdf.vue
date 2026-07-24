<template>
  <iframe :src="pdfurl" frameborder="0" class="z-30 w-full"></iframe>
  <!-- <object :data="pdf" type="application/pdf" class="z-30 w-full">
    <div>No PDF viewer available</div>
  </object> -->
  <!-- <vue-pdf-app :pdf="pdf" :config="config"></vue-pdf-app> -->
</template>

<script>
const getSidebar = () => ({
  viewThumbnail: true,
  viewOutline: true,
  viewAttachments: true,
});
const getSecondaryToolbar = () => ({
  secondaryPresentationMode: true,
  secondaryOpenFile: false,
  secondaryPrint: false,
  secondaryDownload: true,
  secondaryViewBookmark: true,
  firstPage: true,
  lastPage: true,
  pageRotateCw: true,
  pageRotateCcw: true,
  cursorSelectTool: true,
  cursorHandTool: true,
  scrollVertical: true,
  scrollHorizontal: true,
  scrollWrapped: true,
  spreadNone: true,
  spreadOdd: true,
  spreadEven: true,
  documentProperties: true,
});
const getToolbarViewerLeft = () => ({
  findbar: true,
  previous: true,
  next: true,
  pageNumber: true,
});
const getToolbarViewerRight = () => ({
  presentationMode: true,
  openFile: false,
  print: false,
  download: true,
  viewBookmark: false,
});
const getToolbarViewerMiddle = () => ({
  zoomOut: true,
  zoomIn: true,
  scaleSelectContainer: true,
});
const getToolbar = () => ({
  toolbarViewerLeft: getToolbarViewerLeft(),
  toolbarViewerRight: getToolbarViewerRight(),
  toolbarViewerMiddle: getToolbarViewerMiddle(),
});

//import VuePdfApp from "vue3-pdf-app";
// import this to use default icons for buttons
//import "vue3-pdf-app/dist/icons/main.css";
export default {
  props: {
    data: {
      required: true,
    },
    isURL:{
      type:Boolean,
      required:true,
    }
  },
  name: "pdf",
  data() {
    return {
      config: {
        sidebar: getSidebar(),
        secondaryToolbar: getSecondaryToolbar(),
        toolbar: getToolbar(),
        errorWrapper: true,
      },
      pdf_exist: true,
      pdf: "",
      pdfurl:"",
    };
  },
  methods: {
    loadPdf() {
      if (typeof this.data != "string") return;
      if (this.data === "") {
        this.pdf_exist = false;
      } 
      else {
        this.pdf_exist = true;
        if(this.isURL){
          this.pdfurl = this.data
        }
        else{
          this.pdfurl = URL.createObjectURL(this.data)
        }
        //this.pdfurl = URL.createObjectURL(blob)
        // this.$readAsDataURL(blob).then((result) => {
        //   this.pdf = result;
        // });
      }
    },
  },
  watch: {
    config() {
      this.loadPdf();
    },
    pdf_exist() {
      this.loadPdf();
    },
    data(value) {
      this.loadPdf();
    },
  },
};
</script>

<style>
.pdf-app #outerContainer .hiddenMediumView {
  display: block !important;
}

.pdf-app #outerContainer .hiddenLargeView {
  display: block !important;
}

.pdf-app #outerContainer .open-file {
  display: none !important;
}

.pdf-app #thumbnailView {
  width: auto !important;
}
</style>
