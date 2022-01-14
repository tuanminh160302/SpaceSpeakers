import { useState, useEffect, useRef, Fragment } from 'react'
import './user-post.styles.scss'
import { ReactComponent as HeartSVG } from '../../assets/heart.svg'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { uploadComment } from '../../firebase/firebase.init'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getTargetUserUID, reactPostAction } from '../../firebase/firebase.init'
import { useNavigate, useLocation } from 'react-router'
import gsap from 'gsap'

const UserPost = ({ className, postImg, imgTitle, userAvt, postUserName, caption, timestamp, postOfUser, postKey }) => {

    const db = getFirestore()
    const auth = getAuth()
    const navigate = useNavigate()
    const location = useLocation()
    let pathname = location.pathname
    const reactionBtnRef = useRef()
    const [comment, setComment] = useState('')
    const [uidFrom, setUidFrom] = useState(null)
    const [allComment, setAllComment] = useState([])
    const [showAllComment, setShowAllComment] = useState(false)
    const [numLike, setNumLike] = useState(0)

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUidFrom(user.uid)
            }
        })
    }, [auth])

    const fetchPostComment = () => {
        const postRef = doc(db, 'posts', postOfUser)
        getDoc(postRef).then(async (snapshot) => {
            const data = snapshot.data()
            const allCommentObject = data[postKey].comment
            if (!allCommentObject) {
                setAllComment([])
            }
            if (allCommentObject) {
                const allCommentArray = Object.keys(allCommentObject)
                allCommentArray.sort((a, b) => (a > b ? 1 : -1))
                const resolveAllComment = allCommentArray.map(async (timestamp) => {
                    const commentContent = allCommentObject[timestamp][1]
                    let userAvt = null
                    let userName = null
                    const commentByUid = allCommentObject[timestamp][0]
                    const userRef = doc(db, 'users', commentByUid)
                    await getDoc(userRef).then((snapshot) => {
                        userAvt = snapshot.data().avatarURL
                        userName = snapshot.data().username
                    })
                    return [userAvt, commentContent, userName, timestamp]
                })

                await Promise.all(resolveAllComment).then((responses) => {
                    setAllComment(responses)
                })
            }
        })
    }

    useEffect(() => {
        fetchPostComment()
    }, [location, postKey])

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

    const postComment = allComment.map(([userAvt, commentContent, userName, timestamp], index) => {
        const time = new Date(parseInt(timestamp))
        const timeNow = new Date()
        let timeSpan = null
        if (Math.floor((timeNow - time) / 86400000) === 0) {
            timeSpan = String(Math.floor((timeNow - time) / 3600000)) + "h"
        } else if (Math.floor((timeNow - time) / 86400000) !== 0) {
            timeSpan = String(Math.floor((timeNow - time) / 86400000)) + "d"
        }
        return (
            <Fragment key={index}>
                <div className='comment-container'>
                    <div className='comment-user-avt-container'>
                        <img className='comment-user-avt' src={userAvt} />
                    </div>
                    <p className='comment-content'>
                        <span className='comment-by' onClick={(e) => { handleRedirectUser(e) }}>{userName}</span>
                        {commentContent}
                    </p>
                </div>
                <p className='comment-timespan'>
                    {timeSpan}
                </p>
            </Fragment>
        )
    })

    const postCommentShrink = postComment.slice(0, 3)

    const handleSubmitComment = async (e) => {
        e.preventDefault()
        await uploadComment(uidFrom, postOfUser, postKey, [new Date().getTime(), comment])
        setComment('')
        fetchPostComment()
    }

    const handleInputChange = (e) => {
        e.preventDefault()
        setComment(e.target.value)
    }

    const handleSeeAllComment = () => {
        showAllComment ? setShowAllComment(false) : setShowAllComment(true)
    }

    const reactedCheck = () => {
        const postRef = doc(db, 'posts', postOfUser)
        getDoc(postRef).then((snapshot) => {
            const data = snapshot.data()
            if (!data) return 
            const post = data[postKey]
            if (post) {
                const reactionObject = post.reaction
                if (reactionObject) {
                    const reactionUserList = Object.keys(reactionObject)
                    setNumLike(reactionUserList.length)
                    if (reactionUserList.includes(uidFrom)) {
                        gsap.to(reactionBtnRef.current, {duration: 0, fill: 'red'})
                    } else {
                        gsap.to(reactionBtnRef.current, {duration: 0, fill: 'black'})
                    }
                }
            }
        })
    }

    useEffect(() => {
        reactedCheck()
    })

    const handleLikeAction = async () => {
        await reactPostAction(uidFrom, postOfUser, postKey, 'love')
        reactedCheck()
    }

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
                    <HeartSVG ref={reactionBtnRef} className='like-btn' onClick={() => {handleLikeAction()}}/>
                </div>
                <img className='post-img' src={postImg} alt="" />
                <p className='img-title'>{imgTitle}</p>
            </div>
            <div className='comment-section'>
                <p className='title'>Comment</p>
                <div className='all-comment-container'>
                    {
                        showAllComment ? postComment : postCommentShrink
                    }
                </div>
                {
                    showAllComment ? <p className='show-all-comment-prompt' onClick={() => {handleSeeAllComment()}}>Hide</p> :
                    postCommentShrink.length < postComment.length ? 
                        <p className='show-all-comment-prompt' onClick={() => {handleSeeAllComment()}}>Read {postComment.length - postCommentShrink.length} more...</p> :
                        null
                }
                <form className='add-comment-container' onSubmit={(e) => { handleSubmitComment(e) }}>
                    <input className='add-comment-input' name='comment' type="text" required placeholder='Comment here...' value={comment} onChange={(e) => { handleInputChange(e) }} />
                    <button className='add-comment-btn'>Post</button>
                </form>
            </div>
        </div>
    )
}

export default UserPost