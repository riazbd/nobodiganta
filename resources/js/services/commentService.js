/**
 * Comment Service
 * Communicates with Laravel backend for reader comments
 */

export async function getComments(articleId, { page = 1, sort = 'newest' } = {}) {
  try {
    const response = await fetch(`/api/articles/${articleId}/comments?page=${page}&sort=${sort}`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch comments');
    
    return await response.json();
  } catch (error) {
    console.error('Error in getComments:', error);
    return { data: [], meta: { total: 0 } };
  }
}

export async function postComment({ articleId, name, email, text, parentId = null }) {
  try {
    const response = await fetch(`/api/articles/${articleId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({
        name,
        email,
        body: text,
        parent_id: parentId,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Failed to post comment',
        errors: data.errors 
      };
    }
    
    return { success: true, ...data };
  } catch (error) {
    console.error('Error in postComment:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

export async function flagComment(commentId, reason) {
  try {
    const response = await fetch(`/api/comments/${commentId}/flag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
      },
      body: JSON.stringify({ reason }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error in flagComment:', error);
    return { success: false };
  }
}
