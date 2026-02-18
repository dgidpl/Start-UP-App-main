const API_URL = 'https://script.google.com/macros/s/AKfycbwLHz4q-vCrb7Li6lpfk-klHk17tBsU7jToNRdTLnmgg-EbjSyQwP-om0-5PzbGG_bq/exec';

async function request(options = {}) {
    const { method = 'GET', params = {}, body = null } = options;

    let url = API_URL;
    if (method === 'GET' && Object.keys(params).length) {
        const qs = new URLSearchParams({ ...params, t: Date.now() });
        url += '?' + qs.toString();
    }

    const fetchOptions = { method };
    if (body) {
        fetchOptions.headers = { "Content-Type": "text/plain;charset=utf-8" };
        fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

export const fetchIdeas = () =>
    request({ params: { action: 'getData' } });

export const createIdea = (data) =>
    request({ method: 'POST', body: { action: 'create_idea', ...data } });

export const vote = (id, type) =>
    request({ method: 'POST', body: { action: 'vote', id, type } });

export const getComments = (ideaId) =>
    request({ params: { action: 'get_comments', id: ideaId } });

export const addComment = (ideaId, author, text) =>
    request({ method: 'POST', body: { action: 'add_comment', ideaId, text, author } });
