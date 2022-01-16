import { useEffect, useState } from 'react';
import './user-snippet.styles.scss'
import { useNavigate } from 'react-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { followAction } from '../../firebase/firebase.init';

const UserSnippet = ({ socialType, person, handleExitShowFollower, handleExitShowFollowing, fetchSocialStatus }) => {

    const db = getFirestore()
    const auth = getAuth()
    const navigate = useNavigate()
    const uid = person[0]
    const username = person[1][0]
    const avatarURL = person[1][1]
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

    return (
        <div className='person'>
            {
                !showSnippet ?
                    <>
                        <div className="progress">
                            <div className="progress-value"></div>
                        </div>
                    </> :
                    <>
                        <img className='person-avt' src={avatarURL} alt="" onClick={() => { socialType === 'follower' ? handleTypeFollower() : handleTypeFollowing() }} />
                        <p className='person-username' onClick={() => { socialType === 'follower' ? handleTypeFollower() : handleTypeFollowing() }}>{username}</p>
                        <button className='person-follow' onClick={() => {handleFollowAction()}}>{isFollow ? 'Unfollow' : 'Follow'}</button>
                    </>
            }
        </div>
    )
}

export default UserSnippet;