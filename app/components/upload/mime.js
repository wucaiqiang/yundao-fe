export default class Mime {
  static mimeData = "" +
  "application/msword,doc dot," +
  "application/pdf,pdf," +
  "application/pgp-signature,pgp," +
  "application/postscript,ps ai eps," +
  "application/rtf,rtf," +
  "application/vnd.ms-excel,xls xlb," +
  "application/vnd.ms-powerpoint,ppt pps pot," +
  "application/zip,zip," +
  "application/x-shockwave-flash,swf swfl," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
  "application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," +
  "application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
  "application/x-javascript,js," +
  "application/json,json," +
  "audio/mpeg,mp3 mpga mpega mp2," +
  "audio/x-wav,wav," +
  "audio/x-m4a,m4a," +
  "audio/ogg,oga ogg," +
  "audio/aiff,aiff aif," +
  "audio/flac,flac," +
  "audio/aac,aac," +
  "audio/ac3,ac3," +
  "audio/x-ms-wma,wma," +
  "image/bmp,bmp," +
  "image/gif,gif," +
  "image/jpeg,jpg jpeg jpe," +
  "image/photoshop,psd," +
  "image/png,png," +
  "image/svg+xml,svg svgz," +
  "image/tiff,tiff tif," +
  "text/plain,asc txt text diff log," +
  "text/html,htm html xhtml," +
  "text/css,css," +
  "text/csv,csv," +
  "text/rtf,rtf," +
  "video/mpeg,mpeg mp4v mpg mpe m2v," +
  "video/quicktime,qt mov," +
  "video/mp4,mp4," +
  "video/x-m4v,m4v," +
  "video/x-flv,flv," +
  "video/x-f4v,f4v," +
  "video/x-ms-wmv,wmv," +
  "video/avi,avi," +
  "video/webm,webm," +
  "video/3gpp,3gpp 3gp," +
  "video/3gpp2,3g2," +
  "video/vnd.rn-realvideo,rv," +
  "application/vnd.rn-realmedia-vbr,rmvb," +
  "video/x-ms-asf,asf," +
  "video/x-ms-asf,asx," +
  "video/x-ms-wm,wm," +
  "video/x-pn-realvideo,ra," +
  "application/vnd.rn-realmedia,rm," +
  "video/x-pn-realvideo,ram," +
  "video/dvd,vob," +
  "application/octet-stream,dat," +
  "video/ogg,ogv," +
  "video/x-matroska,mkv," +
  "application/vnd.oasis.opendocument.formula-template,otf," +
  "application/octet-stream,exe";


  constructor() {
    this.addMimeType(Mime.mimeData);
  }

  mimes = {};
  extensions = {};

  // Parses the default mime types string into a mimes and extensions lookup maps
  addMimeType(mimeData) {
    var items = mimeData.split(/,/),
      i,
      ii,
      ext;

    for (i = 0; i < items.length; i += 2) {
      ext = items[i + 1].split(/ /);

      // extension to mime lookup
      for (ii = 0; ii < ext.length; ii++) {
        this.mimes[ext[ii]] = items[i];
      }
      // mime to extension lookup
      this.extensions[items[i]] = ext;
    }
  }
  extList2mimes(filters, addMissingExtensions) {
    var self = this,
      ext = filters.split(/\s*,\s*/),
      i,
      ii,
      type,
      mimes = [];

    // convert extensions to mime types list

    for (ii = 0; ii < ext.length; ii++) {
      // if there's an asterisk in the list, then accept attribute is not required
      if (ext[ii] === "*") {
        return [];
      }

      type = self.mimes[ext[ii]];
      if (!type) {
        if (addMissingExtensions && /^\w+$/.test(ext[ii])) {
          mimes.push("." + ext[ii]);
        } else {
          return []; // accept all
        }
      } else if (mimes.indexOf(type) === -1) {
        mimes.push(type);
      }
    }
    return mimes;
  }
  mimes2exts(mimes) {
    var self = this,
      exts = [];

    mimes.forEach(function(mime) {
      if (mime === "*") {
        exts = [];
        return false;
      }

      // check if this thing looks like mime type
      var m = mime.match(/^(\w+)\/(\*|\w+)$/);
      if (m) {
        if (m[2] === "*") {
          // wildcard mime type detected
          self.extensions.forEach(function(arr, mime) {
            if (new RegExp("^" + m[1] + "/").test(mime)) {
              [].push.apply(exts, self.extensions[mime]);
            }
          });
        } else if (self.extensions[mime]) {
          [].push.apply(exts, self.extensions[mime]);
        }
      }
    });
    return exts;
  }
  mimes2extList(mimes) {
    var exts = [];

    if (typeof mimes === "string") {
      mimes = mimes.trim().split(/\s*,\s*/);
    }

    exts = this.mimes2exts(mimes);

    return exts.length ? exts.join(",") : "*";
  }
  getFileExtension(fileName) {
    var matches = fileName && fileName.match(/\.([^.]+)$/);
    if (matches) {
      return matches[1].toLowerCase();
    }
    return "";
  }
  getFileMime(fileName) {
    return this.mimes[this.getFileExtension(fileName)] || "";
  }
}
