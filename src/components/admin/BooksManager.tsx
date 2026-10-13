import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Download, 
  AlertCircle,
  Eye,
  FileCheck,
  Star,
  ExternalLink
} from 'lucide-react';
import { BookAssignment, BookAttendanceRecord, Cohort } from '../../types';
import { api } from '../../services/api';

interface BooksManagerProps {
  cohorts: Cohort[];
  selectedCohortId: string;
  books: BookAssignment[];
  bookAttendanceRecords: BookAttendanceRecord[];
  onRefresh: () => void;
}

export const BooksManager: React.FC<BooksManagerProps> = ({
  cohorts,
  selectedCohortId,
  books,
  bookAttendanceRecords,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<BookAssignment | null>(null);

  // Form states
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [totalPages, setTotalPages] = useState<number>(300);
  const [pagesPerDay, setPagesPerDay] = useState<number>(15);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [stopDate, setStopDate] = useState(new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'doc' | 'docx' | 'epub'>('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cohortBooks = books.filter(b => !selectedCohortId || b.cohortId === selectedCohortId);

  const handleOpenCreateModal = () => {
    setEditingBookId(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setTotalPages(300);
    setPagesPerDay(15);
    setStartDate(new Date().toISOString().split('T')[0]);
    setStopDate(new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]);
    setDeadline(new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0]);
    setAdditionalDetails('');
    setFileName('');
    setFileType('pdf');
    setFileUrl('');
    setFileSize(0);
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book: BookAssignment) => {
    setEditingBookId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description || '');
    setTotalPages(book.totalPages || 300);
    setPagesPerDay(book.pagesPerDay || 15);
    setStartDate(book.startDate);
    setStopDate(book.stopDate);
    setDeadline(book.deadline);
    setAdditionalDetails(book.additionalDetails || '');
    setFileName(book.fileName || '');
    setFileType((book.fileType as any) || 'pdf');
    setFileUrl(book.fileUrl || '');
    setFileSize(book.fileSizeBytes || 0);
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'epub' || ext === 'doc' || ext === 'docx') {
      setFileType(ext as any);
    }

    // Read as Data URL so students can immediately download/view on devices
    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setStatusMsg({ type: 'error', text: 'Book title and author are required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    const payload: Partial<BookAssignment> = {
      cohortId: selectedCohortId || 'dtp-cohort-2',
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      totalPages: Number(totalPages) || 300,
      pagesPerDay: Number(pagesPerDay) || 15,
      startDate,
      stopDate,
      deadline,
      additionalDetails: additionalDetails.trim(),
      fileName: fileName || `${title.replace(/\s+/g, '_')}.${fileType}`,
      fileType,
      fileUrl: fileUrl || undefined,
      fileSizeBytes: fileSize || 1024 * 500,
      isActive: true,
    };

    try {
      if (editingBookId) {
        await api.updateBook(editingBookId, payload);
      } else {
        await api.createBook(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to save book assignment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book assignment and its attendance records?')) {
      return;
    }
    try {
      await api.deleteBook(bookId);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete book');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 ring-4 ring-indigo-50">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Book Reading Challenge Manager
            </h3>
            <p className="text-xs text-slate-500">
              Upload PDF/DOC/EPUB reading material, set daily page quotas, reading windows, and monitor student reviews.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Book Assignment</span>
        </button>
      </div>

      {/* Book List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cohortBooks.map((book) => {
          const records = bookAttendanceRecords.filter(r => r.bookId === book.id);
          return (
            <div 
              key={book.id}
              className="bg-white border-2 border-slate-200 hover:border-violet-300 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
                    {book.fileType ? book.fileType.toUpperCase() : 'PDF'} Document
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditBook(book)}
                      title="Edit Book Details"
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      title="Delete Book Assignment"
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-lg font-black text-slate-900 leading-snug line-clamp-1">
                  {book.title}
                </h4>
                <p className="text-xs font-bold text-indigo-600 mb-2">
                  by {book.author}
                </p>

                {book.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {book.description}
                  </p>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Daily Target</span>
                    <strong className="text-slate-800">{book.pagesPerDay} pages/day</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Length</span>
                    <strong className="text-slate-800">{book.totalPages || 300} pages</strong>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Reading Window:</span>
                    <strong className="text-slate-700">{book.startDate} &rarr; {book.stopDate}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-bold">Deadline:</span>
                    <strong className="text-rose-700">{book.deadline}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Attendance Card & Inspect Reviews */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-600" />
                    Attendance Logs:
                  </span>
                  <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {records.length} check-ins
                  </span>
                </div>

                <button
                  onClick={() => setSelectedBookForDetails(book)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Student Reviews ({records.length})</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {cohortBooks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-base font-black text-slate-700">No books uploaded yet for this cohort.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Upload New Book Assignment" above to assign PDF/EPUB books.</p>
        </div>
      )}

      {/* CREATE / EDIT BOOK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingBookId ? 'Edit Book Reading Assignment' : 'Assign New Book for Reading Challenge'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload book files (PDF, Word, EPUB) and configure student daily reading goals.
            </p>

            {statusMsg && (
              <div className={`p-3 rounded-xl text-xs mb-4 ${statusMsg.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                    Book Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assigned Book Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. James Clear"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                  Description / Study Objective
                </label>
                <textarea
                  rows={2}
                  placeholder="Key topics, themes, and why the cohort is reading this book..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900"
                />
              </div>

              {/* Upload Book File in PDF / Word / EPUB */}
              <div className="p-4 bg-violet-50/70 border-2 border-dashed border-violet-300 rounded-2xl text-center">
                <Upload className="w-6 h-6 text-violet-600 mx-auto mb-1.5" />
                <label className="text-xs font-bold text-violet-900 block cursor-pointer">
                  <span>Upload Book File (PDF, DOC, DOCX, EPUB)</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.epub"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {fileName ? (
                  <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    File Selected: {fileName} ({Math.round(fileSize / 1024)} KB)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click to browse files or provide manual download link below.
                  </p>
                )}
              </div>

              {/* Pages details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                    Pages to Read Per Day <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pagesPerDay}
                    onChange={(e) => setPagesPerDay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                    Total Book Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                    Start Day
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                    Stop Day
                  </label>
                  <input
                    type="date"
                    required
                    value={stopDate}
                    onChange={(e) => setStopDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase mb-1">
                    Finish Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-rose-50 border border-rose-300 rounded-2xl px-3 py-2 text-xs font-bold text-rose-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                  Additional Reading Instructions &amp; Rules
                </label>
                <input
                  type="text"
                  placeholder="e.g. Read at least 15 pages daily. Review what you learned to claim your daily 10 Greatness points!"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingBookId ? 'Save Changes' : 'Publish Book Assignment'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* INSPECT REVIEWS MODAL */}
      {selectedBookForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                  Attendance Records Under Book
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  "{selectedBookForDetails.title}"
                </h3>
                <p className="text-xs text-slate-500">
                  Daily page target: {selectedBookForDetails.pagesPerDay} pages &bull; Deadline: {selectedBookForDetails.deadline}
                </p>
              </div>
              <button
                onClick={() => setSelectedBookForDetails(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List of Student Reviews under this book */}
            {bookAttendanceRecords.filter(r => r.bookId === selectedBookForDetails.id).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm font-bold text-slate-600">No reviews recorded yet for this book.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookAttendanceRecords
                  .filter(r => r.bookId === selectedBookForDetails.id)
                  .map((rec) => (
                    <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-black text-slate-900">{rec.studentName}</strong>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">({rec.studentEmail})</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          +10 Pts Alloted
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                        "{rec.review}"
                      </div>

                      {rec.keyTakeaway && (
                        <p className="text-[11px] font-bold text-violet-700">
                          💡 Key Takeaway: <span className="text-slate-600 font-medium">{rec.keyTakeaway}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Pages Read: <strong className="text-slate-700">{rec.pagesReadToday || 15}</strong></span>
                        <span>{new Date(rec.markedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
