import { useState } from 'react'
import './comment.styles.scss'
import { ReactComponent as DeleteSVG } from '../../assets/delete.svg'
import { deleteComment, getTargetUserUID } from '../../firebase/firebase.init'
import { useNavigate, useLocation } from 'react-router'

const CommentComponent = ({ userAvt, commentContent, userName, timestamp, commentByUid, uidFrom, fetchPostComment, postOfUser, postKey}) => {

    const navigate = useNavigate()
    const location = useLocation()
    const pathname = location.pathname
    const [confirmDeleteComment, setConfirmDeleteComment] = useState(false)

    const handleRedirectUser = async (e) => {
        const username = e.target.innerText
        let uid = null
        await getTargetUserUID(username).then((res) => {
            uid = res
            return uid
        }).then((uid) => {
            if (pathname !== `/users/${username}_${uid}`) {
                navigate(`/users/${username}_${uid}`)
            }
        })
    }

    const handleDeleteComment = async () => {
        await deleteComment(postOfUser, postKey, timestamp)
        setConfirmDeleteComment(false)
        fetchPostComment()
    }

    const time = new Date(parseInt(timestamp))
    const timeNow = new Date()
    let timeSpan = null
    if (Math.floor((timeNow - time) / 86400000) === 0) {
        timeSpan = String(Math.floor((timeNow - time) / 3600000)) + "h"
    } else if (Math.floor((timeNow - time) / 86400000) !== 0) {
        timeSpan = String(Math.floor((timeNow - time) / 86400000)) + "d"
    }
    
    return (
        <div className='comment'>
            <div className='comment-container'>
                <div className='comment-user-avt-container'>
                    <img className='comment-user-avt' src={userAvt} />
                </div>
                <p className='comment-content'>
                    <span className='comment-by' onClick={(e) => { handleRedirectUser(e) }}>{userName}</span>
                    {commentContent}
                </p>
                {
                    commentByUid === uidFrom ? <DeleteSVG className='delete-comment-svg' onClick={() => { setConfirmDeleteComment(true); document.body.style.overflowY = 'hidden' }} /> : null
                }
                {
                    confirmDeleteComment ?
                        <div className='confirm-delete-comment-container'>
                            <div className='exit-confirm-delete-comment' onClick={() => {setConfirmDeleteComment(false); document.body.style.overflowY = 'visible'}}></div>
                            <div className='confirm-delete-comment'>
                                <p className='warning'>This action cannot be undone</p>
                                <div className='option-container'>
                                    <p className='option' onClick={() => {setConfirmDeleteComment(false)}}>Cancel</p>
                                    <p className='option' onClick={() => {handleDeleteComment()}}>Delete</p>
                                </div>
                            </div>
                        </div> : null
                }
            </div>
            <p className='comment-timespan'>
                {timeSpan}
            </p>
        </div>
    )
}

export default CommentComponent