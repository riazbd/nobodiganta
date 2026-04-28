import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getComments, postComment, flagComment } from '../../services/commentService';
import { validateCommentForm } from '../../lib/validators';
import { toBengaliNum } from '../../lib/formatters';
import { MessageSquare, ThumbsUp, Flag, Reply, User, Send, Clock, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

function CommentItem({ comment, lang, onReply, onFlag }) {
  return (
    <div className="group animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ padding: '20px 0', borderBottom: '1px solid #f1f3f7' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            background: 'linear-gradient(135deg, #e8001e 0%, #ff4d4d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 4px 12px rgba(232, 0, 30, 0.15)'
          }}>
            {comment.name?.charAt(0).toUpperCase() || <User size={20} />}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1d2e' }}>{comment.name}</span>
              <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />
                {new Date(comment.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onFlag?.(comment.id)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
                title={lang === 'bn' ? 'রিপোর্ট করুন' : 'Report'}
              >
                <Flag size={14} />
              </button>
            </div>
          </div>
          
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#4b5563', marginBottom: 12 }}>{comment.body || comment.text}</p>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 5, 
              fontSize: 12, 
              color: '#6b7280', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 600,
              padding: '4px 0'
            }}>
              <ThumbsUp size={14} />
              {lang === 'bn' ? toBengaliNum(String(comment.upvotes || 0)) : (comment.upvotes || 0)}
            </button>
            
            <button
              onClick={() => onReply?.(comment.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 5, 
                fontSize: 12, 
                color: '#e8001e', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontWeight: 600,
                padding: '4px 0'
              }}
            >
              <Reply size={14} />
              {lang === 'bn' ? 'উত্তর দিন' : 'Reply'}
            </button>
          </div>

          {comment.replies?.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {comment.replies.map((reply) => (
                <div key={reply.id} style={{ paddingLeft: 16, borderLeft: '2px solid #f3f4f6' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                     <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1d2e' }}>{reply.name}</span>
                     <span style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(reply.created_at).toLocaleDateString()}</span>
                   </div>
                   <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6 }}>{reply.body || reply.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentForm({ articleId, parentId, lang, onSuccess, onCancel }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', text: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateCommentForm(form, lang);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    
    const res = await postComment({ articleId, parentId, ...form });
    setSubmitting(false);
    
    if (res.success) {
      setDone(true);
      showToast(lang === 'bn' ? 'মন্তব্য সফলভাবে জমা হয়েছে' : 'Comment submitted successfully');
      setTimeout(() => {
        setDone(false);
        setForm({ name: '', email: '', text: '' });
        onSuccess?.();
      }, 3000);
    } else {
      showToast(res.message, 'error');
      if (res.errors) setErrors(res.errors);
    }
  };

  if (done) {
    return (
      <div className="bg-green-50 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-300 border border-green-100 mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h4 className="font-bold text-green-800 mb-1">{lang === 'bn' ? 'ধন্যবাদ!' : 'Thank you!'}</h4>
        <p className="text-sm text-green-700">
          {lang === 'bn' ? 'আপনার মন্তব্য পর্যালোচনার জন্য পাঠানো হয়েছে।' : 'Your comment has been submitted for review.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'bn' ? 'নাম' : 'Name'} *</label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none`}
            placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'}
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'bn' ? 'ইমেইল' : 'Email'} *</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            className={`w-full bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none`}
            placeholder="example@mail.com"
          />
          {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email}</p>}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{lang === 'bn' ? 'আপনার মন্তব্য' : 'Comment'} *</label>
        <textarea
          value={form.text}
          onChange={set('text')}
          rows={4}
          className={`w-full bg-gray-50 border ${errors.text || errors.body ? 'border-red-500' : 'border-gray-100'} rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none resize-none`}
          placeholder={lang === 'bn' ? 'সংবাদের ওপর আপনার গঠনমূলক মন্তব্য লিখুন...' : 'Write your constructive comment on this news...'}
        />
        {(errors.text || errors.body) && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.text || errors.body}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button 
          type="submit" 
          disabled={submitting} 
          className="flex-1 md:flex-none bg-[#e8001e] text-white px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#b8001a] shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
        >
          {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
          {lang === 'bn' ? 'মন্তব্য প্রকাশ করুন' : 'Post Comment'}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
        )}
      </div>
    </form>
  );
}

export default function ArticleComments({ articleId }) {
  const { lang } = useApp();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getComments(articleId).then((res) => {
      setComments(res.data || []);
      setTotal(res.total || res.meta?.total || 0);
      setLoading(false);
    });
  }, [articleId, refreshKey]);

  const handleFlag = async (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি এই মন্তব্যটি রিপোর্ট করতে চান?' : 'Do you want to report this comment?')) {
      const res = await flagComment(id, 'User reported');
      if (res.success) {
        showToast(lang === 'bn' ? 'রিপোর্ট জমা হয়েছে' : 'Report submitted');
      }
    }
  };

  const totalLabel = lang === 'bn'
    ? `${toBengaliNum(String(total))}টি মন্তব্য`
    : `${total} comment${total !== 1 ? 's' : ''}`;

  return (
    <section className="comments-section" style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #e5e7eb' }}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2.5 font-['Noto_Sans_Bengali']">
          <MessageSquare className="text-[#e8001e]" size={22} />
          {totalLabel}
        </h3>
        
        <div className="hidden sm:flex items-center gap-2">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lang === 'bn' ? 'সর্টিং:' : 'Sort:'}</span>
           <select className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer">
              <option>{lang === 'bn' ? 'নতুন সবার আগে' : 'Newest'}</option>
              <option>{lang === 'bn' ? 'জনপ্রিয়' : 'Popular'}</option>
           </select>
        </div>
      </div>

      <CommentForm
        articleId={articleId}
        lang={lang}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-[#e8001e] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">{lang === 'bn' ? 'মন্তব্য লোড হচ্ছে...' : 'Loading comments...'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id}>
                <CommentItem
                  comment={c}
                  lang={lang}
                  onReply={setReplyTo}
                  onFlag={handleFlag}
                />
                {replyTo === c.id && (
                  <div className="ml-10 mt-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-[#e8001e] rounded-full"></div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {lang === 'bn' ? 'উত্তর দিচ্ছেন' : 'Replying to comment'}
                      </p>
                    </div>
                    <CommentForm
                      articleId={articleId}
                      parentId={c.id}
                      lang={lang}
                      onSuccess={() => { setRefreshKey((k) => k + 1); setReplyTo(null); }}
                      onCancel={() => setReplyTo(null)}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium italic">
                {lang === 'bn' ? 'প্রথম মন্তব্যকারী আপনিই হোন!' : 'Be the first to comment!'}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
