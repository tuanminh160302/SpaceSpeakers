import { useState } from 'react'

export const useComment = (getTargetUserUID, pathname, navigate, deleteComment, postOfUser, postKey, timestamp, fetchPostComment) => {

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
            } else {
                window.location.reload()
            }
        })
    }

    const handleDeleteComment = async () => {
        await deleteComment(postOfUser, postKey, timestamp)
        setConfirmDeleteComment(false)
        document.body.style.overflowY = 'visible'
        fetchPostComment()
    }

    return [confirmDeleteComment, handleRedirectUser, handleDeleteComment, setConfirmDeleteComment]
}