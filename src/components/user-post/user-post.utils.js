import { useState, useEffect } from "react";
import gsap from "gsap";

export const useLocationControl = (location, pathname) => {
    const [isInProfile, setIsInProfile] = useState(false)

    useEffect(() => {
        if (pathname.includes('users')) {
            setIsInProfile(true)
        }
    }, [location])

    return isInProfile
}

export const useUidFrom = (auth, onAuthStateChanged) => {
    const [uidFrom, setUidFrom] = useState(null)
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUidFrom(user.uid)
            }
        })
    }, [auth])
    return uidFrom
}

export const useFetchPostComment = (location, postKey, db, doc, getDoc, postOfUser, uploadComment, uidFrom) => {
    const [comment, setComment] = useState('')
    const [allComment, setAllComment] = useState([])
    const [showAllComment, setShowAllComment] = useState(false)

    useEffect(() => {
        fetchPostComment()
        setShowAllComment(false)
    }, [location, postKey])

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
                    return [userAvt, commentContent, userName, timestamp, commentByUid]
                })

                await Promise.all(resolveAllComment).then((responses) => {
                    setAllComment(responses)
                })
            }
        })
    }

    const handleSubmitComment = async (e) => {
        e.preventDefault()
        await uploadComment(uidFrom, postOfUser, postKey, [new Date().getTime(), comment])
        setComment('')
        fetchPostComment()
    }

    const handleSeeAllComment = () => {
        showAllComment ? setShowAllComment(false) : setShowAllComment(true)
    }

    return [fetchPostComment, comment, allComment, showAllComment, handleSubmitComment, handleSeeAllComment, setComment]
}

export const useInputChange = (setComment) => {
    const handleInputChange = (e) => {
        e.preventDefault()
        setComment(e.target.value)
    }

    return handleInputChange
}

export const useReactedCheck = (db, doc, getDoc, postOfUser, postKey, uidFrom, reactionBtnRef) => {
    const [numLike, setNumLike] = useState(0)

    useEffect(() => {
        fetchReaction()
    })

    const fetchReaction = () => {
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
                        gsap.to(reactionBtnRef.current, { duration: 0, fill: 'red' })
                    } else {
                        gsap.to(reactionBtnRef.current, { duration: 0, fill: 'black' })
                    }
                }
            }
        })
    }

    return [numLike, fetchReaction]
}

export const useDeletePost = (deletePost, uidFrom, postKey, fetchPost, setShowPreloader, navigate, isInProfile, postUserName, postOfUser, setViewFullPost) => {
    const [confirmDeletePost, setConfirmDeletePost] = useState(false)

    const handleDeletePost = async () => {
        setShowPreloader(true)
        await deletePost(uidFrom, postKey)
        setConfirmDeletePost(false)
        setViewFullPost(false)
        document.body.style.overflowY = 'visible'
        if (isInProfile) {
            await fetchPost()
            // setShowPreloader(false)
            window.location.reload()
        } else if (!isInProfile) {
            navigate(`/users/${postUserName}_${postOfUser}`)
        }
    }
    
    return [confirmDeletePost, setConfirmDeletePost, handleDeletePost]
}

export const useLikeAction = (reactPostAction, fetchReaction, uidFrom, postOfUser, postKey) => {
    const handleLikeAction = async () => {
        await reactPostAction(uidFrom, postOfUser, postKey, 'love')
        fetchReaction()
    }

    return handleLikeAction
}

export const useRedirectUser = (getTargetUserUID, pathname, navigate) => {
    const handleRedirectUser = async (e) => {
        const username = e.target.innerText
        let uid = null
        await getTargetUserUID(username).then((res) => {
            uid = res
            return uid
        }).then((uid) => {
            if (pathname !== `/users/${username}_${uid}`) {
                navigate(`/users/${username}_${uid}`)
            } else {
                window.location.reload()
            }
        })
    }

    return handleRedirectUser
}