import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getComments, postComment, flagComment } from '../../services/commentService';
import { validateCommentForm } from '../../lib/validators';
import { toBengaliNum } from '../../lib/formatters';
import { useToast } from '../../contexts/ToastContext';

function Avatar({ name }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      background: '#3a3a4a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
    }}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}

function CommentItem({ comment, lang, onReply, onFlag }) {
  const date = new Date(comment.created_at).toLocaleDateString(
    lang === 'bn' ? 'bn-BD' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #ebebeb' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar name={comment.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{comment.name}</span>
            <span style={{ fontSize: 12, color: '#999' }}>{date}</span>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#444', margin: '0 0 10px' }}>
            {comment.body || comment.text}
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => onReply?.(comment.id)}
              style={{ fontSize: 12, color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              {lang === 'bn' ? 'উত্তর দিন' : 'Reply'}
            </button>
            <button
              onClick={() => onFlag?.(comment.id)}
              style={{ fontSize: 12, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {lang === 'bn' ? 'রিপোর্ট' : 'Report'}
            </button>
          </div>

          {comment.replies?.length > 0 && (
            <div style={{ marginTop: 14, borderLeft: '2px solid #e8e8e8', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comment.replies.map((reply) => (
                <div key={reply.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}>{reply.name}</span>
                    <span style={{ fontSize: 11, color: '#bbb' }}>
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.6, margin: 0 }}>
                    {reply.body || reply.text}
                  </p>
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
      showToast(lang === 'bn' ? 'মন্তব্য জমা হয়েছে' : 'Comment submitted');
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

  const inputStyle = (hasError) => ({
    width: '100%', boxSizing: 'border-box',
    background: '#fafafa', border: `1px solid ${hasError ? '#c00' : '#ddd'}`,
    borderRadius: 4, padding: '9px 12px', fontSize: 14,
    outline: 'none', transition: 'border-color .15s',
    fontFamily: 'inherit',
  });

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const errStyle = { fontSize: 11, color: '#c00', marginTop: 3 };

  if (done) {
    return (
      <div style={{ background: '#f5f9f2', border: '1px solid #c8e6c9', borderRadius: 4, padding: '20px 24px', textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#2e7d32', marginBottom: 4 }}>
          {lang === 'bn' ? 'ধন্যবাদ!' : 'Thank you!'}
        </div>
        <p style={{ fontSize: 13, color: '#388e3c', margin: 0 }}>
          {lang === 'bn' ? 'আপনার মন্তব্য পর্যালোচনার জন্য পাঠানো হয়েছে।' : 'Your comment has been submitted for review.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: '20px', marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>{lang === 'bn' ? 'নাম' : 'Name'} *</label>
          <input type="text" value={form.name} onChange={set('name')} style={inputStyle(errors.name)} placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'} />
          {errors.name && <p style={errStyle}>{errors.name}</p>}
        </div>
        <div>
          <label style={labelStyle}>{lang === 'bn' ? 'ইমেইল' : 'Email'} *</label>
          <input type="email" value={form.email} onChange={set('email')} style={inputStyle(errors.email)} placeholder="example@mail.com" />
          {errors.email && <p style={errStyle}>{errors.email}</p>}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{lang === 'bn' ? 'মন্তব্য' : 'Comment'} *</label>
        <textarea
          value={form.text} onChange={set('text')} rows={4}
          style={{ ...inputStyle(errors.text || errors.body), resize: 'vertical' }}
          placeholder={lang === 'bn' ? 'আপনার মন্তব্য লিখুন...' : 'Write your comment...'}
        />
        {(errors.text || errors.body) && <p style={errStyle}>{errors.text || errors.body}</p>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit" disabled={submitting}
          style={{ background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting
            ? (lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...')
            : (lang === 'bn' ? 'মন্তব্য প্রকাশ করুন' : 'Post Comment')}
        </button>
        {onCancel && (
          <button
            type="button" onClick={onCancel}
            style={{ background: '#fff', color: '#555', border: '1px solid #ddd', borderRadius: 4, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
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
    if (confirm(lang === 'bn' ? 'এই মন্তব্যটি রিপোর্ট করবেন?' : 'Report this comment?')) {
      const res = await flagComment(id, 'User reported');
      if (res.success) showToast(lang === 'bn' ? 'রিপোর্ট জমা হয়েছে' : 'Report submitted');
    }
  };

  const totalLabel = lang === 'bn'
    ? `${toBengaliNum(String(total))}টি মন্তব্য`
    : `${total} Comment${total !== 1 ? 's' : ''}`;

  return (
    <section style={{ marginTop: 40, paddingTop: 28, borderTop: '2px solid #1a1a2e' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{totalLabel}</h3>
      </div>

      <CommentForm articleId={articleId} lang={lang} onSuccess={() => setRefreshKey((k) => k + 1)} />

      {loading ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
          {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
        </div>
      ) : comments.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: 14, borderTop: '1px solid #ebebeb' }}>
          {lang === 'bn' ? 'এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যকারী হোন।' : 'No comments yet. Be the first to comment.'}
        </div>
      ) : (
        <div>
          {comments.map((c) => (
            <div key={c.id}>
              <CommentItem comment={c} lang={lang} onReply={setReplyTo} onFlag={handleFlag} />
              {replyTo === c.id && (
                <div style={{ marginLeft: 50, marginTop: 16, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                    {lang === 'bn' ? 'উত্তর দিচ্ছেন' : 'Replying'}
                  </div>
                  <CommentForm
                    articleId={articleId} parentId={c.id} lang={lang}
                    onSuccess={() => { setRefreshKey((k) => k + 1); setReplyTo(null); }}
                    onCancel={() => setReplyTo(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
