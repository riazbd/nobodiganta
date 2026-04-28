import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2 style={{ color: '#c00', marginBottom: 12 }}>
            {this.props.lang === 'en' ? 'Something went wrong' : 'কিছু একটা সমস্যা হয়েছে'}
          </h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            {this.props.lang === 'en'
              ? 'Please refresh the page to try again.'
              : 'পুনরায় চেষ্টা করতে পৃষ্ঠাটি রিফ্রেশ করুন।'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 20px', background: '#c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            {this.props.lang === 'en' ? 'Refresh' : 'রিফ্রেশ করুন'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
