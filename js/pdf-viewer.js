 //
  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.
  //
  var url = '/thinkpython.pdf';
  var count = 0;

  //
  // Disable workers to avoid yet another cross-origin issue (workers need
  // the URL of the script to be loaded, and dynamically loading a cross-origin
  // script does not work).
  //
  // PDFJS.disableWorker = true;

  //
  // In cases when the pdf.worker.js is located at the different folder than the
  // pdf.js's one, or the pdf.js is executed via eval(), the workerSrc property
  // shall be specified.
  //
  PDFJS.workerSrc = '/js/pdf.worker.js';

  page = getUrlVars()["page"];
  if ( page === undefined || page > (234 - 18) || page < 1 || isNaN(page)) {
     page = convertRoman( page );
     
     if (page == "InputError: Not a Roman Numeral" || page > 18) {
      page = 1;
     }
     
  } else {
   page = parseInt(page) + 18;
  }
  
  var pdfDoc = null,
      pageNum = parseInt(page),
      pageRendering = false,
      pageNumPending = null,
      scale = 2,
      canvas = document.getElementById('the-canvas'),
      ctx = canvas.getContext('2d');

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  //document.getElementById('prev').addEventListener('click', onPrevPage);

  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  //document.getElementById('the-canvas').addEventListener('click', onNextPage);

  /**
   * Asynchronously downloads PDF.
   */
  PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });
  $('#the-canvas').on( "swipeleft", function( event ) {
      onNextPage();
    } );
 
  
   $('#the-canvas').on( "swiperight", function( event ) {
      onPrevPage();
    } );
   
   $('#selectPage ul li').click( function() {
        
        var page = parseInt($(this).attr('page'));
        if ( isNaN( page ) ) {
         page = pageNum;
        }
        
        
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            if (page == 8 && count < 1) {
                count++;
            } else {
                count = 0;
                pageNum = parseInt(page);
                queueRenderPage( pageNum );
            }
        } else {
            pageNum = parseInt(page);
            queueRenderPage( pageNum );
        }
   });
   
   $(window).load(function() {
      $('#pdf_wrapper').fadeIn(500);
    });
   
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}