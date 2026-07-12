import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useViewerStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// Use a reliable worker from unpkg matching the installed pdfjs version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewerModal() {
  const { isOpen, driveUrl, title, testId, closeViewer } = useViewerStore();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Save to "Recently Viewed/Saved"
  useEffect(() => {
    if (isOpen && testId && auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid, 'history', testId);
      setDoc(userRef, {
        testId,
        title,
        viewedAt: new Date().toISOString()
      }, { merge: true });
    }
  }, [isOpen, testId, title]);

  if (!isOpen || !driveUrl) return null;

  // Use iframe embed for Google Drive links to bypass all CORS issues on static hosts
  const match = driveUrl.match(new RegExp('/d/([a-zA-Z0-9_-]+)'));
  const fileId = match ? match[1] : null;
  const isGoogleDrive = !!fileId;
  const driveEmbedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : driveUrl;


  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-sm"
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={closeViewer}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-medium truncate max-w-[200px] md:max-w-md">{title}</h2>
          </div>

          {!isGoogleDrive && (
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(s => Math.min(3, s + 0.2))}
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
          )}
        </div>

        {/* PDF Content area */}
        <div 
          className="flex-1 overflow-auto bg-gray-900 flex justify-center p-4"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="relative w-full max-w-5xl flex justify-center">
            {loading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {!hasError ? (
              isGoogleDrive ? (
                <iframe
                  src={driveEmbedUrl}
                  className="w-full h-full min-h-[75vh] border-0 rounded-xl"
                  allow="autoplay"
                  onLoad={() => setLoading(false)}
                ></iframe>
              ) : (
              <Document
                file={driveEmbedUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="text-gray-400">Loading document...</div>}
                onLoadError={(error) => {
                  console.error("PDF load error:", error);
                  setHasError(true);
                  setLoading(false);
                }}
                error={<div className="text-red-400">Failed to load PDF. It might be private or deleted.</div>}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-2xl shadow-black/50"
                />
              </Document>
              )
            ) : (
              <div className="w-full h-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center bg-gray-800 rounded-xl overflow-hidden border border-gray-700 text-red-400 p-4">
                Error loading the test paper.
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        {!isGoogleDrive && (
        <div className="bg-gray-900 border-t border-gray-800 p-4 flex items-center justify-center gap-6">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={previousPage}
            className="p-2 text-white bg-gray-800 rounded-full disabled:opacity-30 hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-white font-medium bg-gray-800 px-4 py-2 rounded-lg">
            Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
          </div>
          
          <button
            type="button"
            disabled={pageNumber >= (numPages || -1)}
            onClick={nextPage}
            className="p-2 text-white bg-gray-800 rounded-full disabled:opacity-30 hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
