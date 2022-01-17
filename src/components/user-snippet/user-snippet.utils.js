import { useEffect, useState } from "react";

export const useUserSnippet = (onAuthStateChanged, auth, db, doc, getDoc, uid, navigate, username, handleExitShowFollower, handleExitShowFollowing, followAction) => {
    const [currentUser, setCurrentUser] = useState()
    const [isFollow, setIsFollow] = useState(false)
    const [showSnippet, setShowSnippet] = useState(false)

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            const uidFrom = user.uid
            const userRef = doc(db, 'users', uidFrom)
            await getDoc(userRef).then((snapshot) => {
                const data = snapshot.data()
                const { socialStatus } = data
                if (socialStatus) {
                    const followingObject = socialStatus.following
                    if (followingObject) {
                        const followingKeyArr = Object.keys(followingObject)
                        if (followingKeyArr.includes(uid)) {
                            setIsFollow(true)
                        } else {
                            setIsFollow(false)
                        }
                    }
                }
            })
            setTimeout(() => {
                setShowSnippet(true)
            }, 1000)
            setCurrentUser(user)
        })

        return () => {
            setShowSnippet(false)
        }
    }, [auth])

    const handleTypeFollower = () => {
        navigate(`/users/${username}_${uid}`)
        handleExitShowFollower()
    }

    const handleTypeFollowing = () => {
        navigate(`/users/${username}_${uid}`)
        handleExitShowFollowing()
    }

    const handleFollowAction = () => {
        console.log(isFollow)
        followAction(currentUser.uid, uid, isFollow).then(() => {
            setIsFollow(!isFollow)
        })
    }

    return [isFollow, showSnippet, handleTypeFollower, handleTypeFollowing, handleFollowAction]
}