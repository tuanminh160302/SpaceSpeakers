import { useState, useEffect } from 'react';

export const useFooter = (auth, onAuthStateChanged, getTargetUsername) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [username, setusername] = useState(null)

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(auth.currentUser)
                if (currentUser) {
                    await getTargetUsername(currentUser.uid).then((res) => {
                        setusername(res)
                    })
                }
            } else {
                setCurrentUser(null)
            }
        })
    }, [auth, currentUser])

    return [currentUser, username]
}