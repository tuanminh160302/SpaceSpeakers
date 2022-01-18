import { useState, useRef, Fragment } from 'react'
import './user-post.styles.scss'
import { useUidFrom, useFetchPostComment, useInputChange, useReactedCheck, useDeletePost, useLikeAction, useRedirectUser } from './user-post.utils'
import { useLocationControl } from './user-post.utils'
import { ReactComponent as HeartSVG } from '../../assets/heart.svg'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { uploadComment } from '../../firebase/firebase.init'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getTargetUserUID, reactPostAction } from '../../firebase/firebase.init'
import { useNavigate, useLocation } from 'react-router'
import CommentComponent from '../comment/comment.component'
import { deletePost } from '../../firebase/firebase.init'
import { connect } from 'react-redux'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'

const UserPost = ({ className, postImg, imgTitle, userAvt, postUserName, caption, timestamp, postOfUser, postKey, fetchPost, setShowPreloader }) => {

    const db = getFirestore()
    const auth = getAuth()
    const navigate = useNavigate()
    const location = useLocation()
    let pathname = location.pathname
    const reactionBtnRef = useRef()
    const [postImgZoom, setPostImgZoom] = useState(false)

    const uidFrom = useUidFrom(auth, onAuthStateChanged)
    const isInProfile = useLocationControl(location, pathname)
    const [fetchPostComment, comment, allComment, showAllComment, handleSubmitComment, handleSeeAllComment, setComment] = useFetchPostComment(location, postKey, db, doc, getDoc, postOfUser, uploadComment, uidFrom)
    const handleInputChange = useInputChange(setComment)
    const [numLike, fetchReaction] = useReactedCheck(db, doc, getDoc, postOfUser, postKey, uidFrom, reactionBtnRef)
    const [confirmDeletePost, setConfirmDeletePost, handleDeletePost] 
    = useDeletePost(deletePost, uidFrom, postKey, fetchPost, setShowPreloader, navigate, isInProfile, postUserName, postOfUser)
    const handleLikeAction = useLikeAction(reactPostAction, fetchReaction, uidFrom, postOfUser, postKey)
    const handleRedirectUser = useRedirectUser(getTargetUserUID, pathname, navigate)

    const postComment = allComment.map(([userAvt, commentContent, userName, timestamp, commentByUid], index) => {
        return (
            <Fragment key={index}>
                <CommentComponent
                    userAvt={userAvt}
                    commentContent={commentContent}
                    userName={userName}
                    timestamp={timestamp}
                    commentByUid={commentByUid}
                    uidFrom={uidFrom}
                    fetchPostComment={fetchPostComment}
                    postOfUser={postOfUser}
                    postKey={postKey} />
            </Fragment>
        )
    })

    const postCommentShrink = postComment.slice(0, 3)

    return (
        <div className={`${className} post-component`}>
            <div className='post-details'>
                <div className='user-content'>
                    <img className='user-avt' src={userAvt} alt="" />
                    <div className='caption-details'>
                        <p className='username' onClick={(e) => { handleRedirectUser(e) }}>{postUserName}</p>
                        <p className='timestamp'>{timestamp}</p>
                        <p className='caption'>{caption}</p>
                    </div>
                    <p className='num-like'>{numLike}</p>
                    <HeartSVG ref={reactionBtnRef} className='like-btn' onClick={() => { handleLikeAction() }} />
                </div>
                <img className='post-img' src={postImg} alt="" onClick={() => { setPostImgZoom(true) }} />
                {
                    postImgZoom ?
                        <div className='post-img-zoom-container'>
                            <div className='exit-post-img-zoom' onClick={() => { setPostImgZoom(false) }}></div>
                            <img className='post-img-zoom' src={postImg} alt="" />
                        </div> : null
                }
                <p className='img-title'>{imgTitle}</p>
                {
                    isInProfile ?
                        <a href={`/posts/${postOfUser}_${postKey}`}><button className='post-btn view-more' onClick={() => { }}>View similar posts</button></a>
                        : null
                }
                {
                    uidFrom === postOfUser ? <button className='post-btn delete-post' onClick={() => { setConfirmDeletePost(true); document.body.style.overflowY = 'hidden' }}>Delete post</button> : null
                }
                {
                    confirmDeletePost ?
                        <div className='confirm-delete-post-container'>
                            <div className='exit-confirm-delete-post' onClick={() => { setConfirmDeletePost(false); document.body.style.overflowY = 'visible' }}></div>
                            <div className='confirm-delete-post'>
                                <p className='warning'>This action cannot be undone</p>
                                <div className='option-container'>
                                    <p className='option' onClick={() => { setConfirmDeletePost(false); document.body.style.overflowY = 'visible' }}>Cancel</p>
                                    <p className='option' onClick={() => { handleDeletePost() }}>Delete</p>
                                </div>
                            </div>
                        </div> : null
                }
            </div>
            <div className='comment-section'>
                <p className='title'>Comment</p>
                <div className='all-comment-container'>
                    {
                        showAllComment ? postComment : postCommentShrink
                    }
                </div>
                {
                    showAllComment ? postComment.length <= 3 ? null : <p className='show-all-comment-prompt' onClick={() => { handleSeeAllComment() }}>Hide</p> :
                        postCommentShrink.length < postComment.length ?
                            <p className='show-all-comment-prompt' onClick={() => { handleSeeAllComment() }}>Read {postComment.length - postCommentShrink.length} more...</p> :
                            null
                }
                <form className='add-comment-container' onSubmit={(e) => { handleSubmitComment(e) }}>
                    <input className='add-comment-input' name='comment' type="text" required placeholder={`${postComment.length ? 'Comment here...' : 'Be the first to comment'}`} value={comment} onChange={(e) => { handleInputChange(e) }} />
                    <button className='add-comment-btn'>Post</button>
                </form>
            </div>
        </div>
    )
}

const mapDispatchToProps = (dispatch) => ({
    setShowPreloader: (boolean) => {dispatch(showPreloader(boolean))}
})

export default connect(null, mapDispatchToProps)(UserPost)