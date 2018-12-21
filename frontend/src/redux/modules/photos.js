// imports
import { actionCreators as userActions} from 'redux/modules/user';

// actions 
const SET_FEED = "SET_FEED";
const LIKE_PHOTO = "LIKE_PHOTO";
const UNLIKE_PHOTO = "UNLIKE_PHOTO";
const ADD_COMMENT = "ADD_COMMENT";

// action creators
const setFeed = (feed) => ({
    type: SET_FEED,
    feed
});

const doLikePhoto = (photoId) => ({
    type: LIKE_PHOTO,
    photoId
});

const doUnLikePhoto = photoId => ({
    type: UNLIKE_PHOTO,
    photoId
});

const addComment = (photoId, comment) => ({
    type: ADD_COMMENT,
    photoId,
    comment
});

// api actions 
function getFeed() {
    return (dispatch, getState) => {
        const { user: { token }} = getState();
        fetch("/images/", {
            headers: {
                "Authorization": `JWT ${token}`
            }
        })
        .then(response => {
            if(response.status === 401) {
                dispatch(userActions.logout());
            } else return response.json();
        })
        .then(json => dispatch(setFeed(json)));
    };
}

const likePhoto = (photoId) => {
    return (dispatch, getState) => {
        dispatch(doLikePhoto(photoId));
        const { user: { token } } = getState();
        fetch(`/images/${photoId}/likes`, {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`
            }
        }).then(response => {
            if(response.status === 401) {
                dispatch(userActions.logout());
            } else if(!response.ok) {
                dispatch(doUnLikePhoto(photoId));
            }
        });
    };
};

const unLikePhoto = (photoId) => {
    return (dispatch, getState) => {
        dispatch(doUnLikePhoto(photoId));
        const { user: { token } } = getState();
        fetch(`/images/${photoId}/unlikes`, {
            method: 'DELETE',
            headers: {
                Authorization: `JWT ${token}`
            }
        }).then(response => {
            if(response.status === 401) {
                dispatch(userActions.logout());
            } else if(!response.ok) {
                dispatch(doLikePhoto(photoId));
            }
        });
    };
};

const commentPhoto = (photoId, message) => {
    return (dispatch, getState) => {
        const { user: { token } } = getState();
        fetch(`/images/${photoId}/comments`, {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`,
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                message
            })
        }).then(response => {
            if(response.status === 401) {
                dispatch(userActions.logout());
            }
            return response.json();
        }).then(json => {
            if(json.message) {
                dispatch(addComment(photoId, json));
            }
        })
    }
}

// initial state 
const initialState = {
};

// reducer
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_FEED:
            return applySetFeed(state, action);
        case LIKE_PHOTO:
            return applyLikePhoto(state, action);
        case UNLIKE_PHOTO:
            return applyUnLikePhoto(state, action);
        case ADD_COMMENT:
            return applyAddComment(state, action);
        default:
            return state;
    }
}
// reducer functions 
const applySetFeed = (state, action) => {
    const { feed } = action;
    return {
        ...state,
        feed
    };
}

const applyLikePhoto = (state, action) => {
    const { photoId } = action;
    const { feed } = state;
    const updateFeed = feed.map(photo => {
        if(photo.id === photoId) {
            return {...photo, is_liked: true, like_counts: photo.like_counts + 1};
        }
        return photo;
    });
    return {...state, feed: updateFeed};
};

const applyUnLikePhoto = (state, action) => {
    const { photoId } = action;
    const { feed } = state;
    const updateFeed = feed.map(photo => {
        if(photo.id === photoId) {
            return {...photo, is_liked: false, like_counts: photo.like_counts - 1};
        }
        return photo;
    });
    return {...state, feed: updateFeed};
};

const applyAddComment = (state, action) => {
    const { photoId, comment } = action;
    const { feed } = state;
    const updateFeed = feed.map(photo => {
        if(photo.id === photoId) {
            return {...photo, comments: [
                ...photo.comments,
                comment
            ]}
        }
        return photo;
    });
    return {...state, feed: updateFeed};
}

// exports 
const actionCreators = {
    getFeed,
    likePhoto,
    unLikePhoto,
    commentPhoto,
};

export { actionCreators };

// export reducer
export default reducer;