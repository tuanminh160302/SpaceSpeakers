import { useEffect, useState } from 'react';
import './user-snippet.styles.scss'
import { useUserSnippet } from './user-snippet.utils';
import { useNavigate } from 'react-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { followAction } from '../../firebase/firebase.init';
import { getTargetUsername, getTargetUserAvt } from '../../firebase/firebase.init';

const UserSnippet = ({ socialType, person, handleExitShowFollower, handleExitShowFollowing }) => {
    
    const db = getFirestore()
    const auth = getAuth()
    const navigate = useNavigate()
    const uid = person[0]
    const [username, setUsername] = useState(null)
    const [avatarURL, setAvatarURL] = useState(null)

    useEffect( async () => {
        await getTargetUsername(uid).then((res) => {
            setUsername(res)
        })
        await getTargetUserAvt(uid).then((res) => {
            setAvatarURL(res)
        })
    }, [])

    const [isFollow, showSnippet, handleTypeFollower, handleTypeFollowing, handleFollowAction]
        = useUserSnippet(onAuthStateChanged, auth, db, doc, getDoc, uid, navigate, username, handleExitShowFollower, handleExitShowFollowing, followAction)

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
                        {auth.currentUser.uid !== uid ?
                            <button className='person-follow' onClick={() => { handleFollowAction() }}>{isFollow ? 'Unfollow' : 'Follow'}</button>
                            : null
                        }
                    </>
            }
        </div>
    )
}

export default UserSnippet;