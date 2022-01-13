// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, QueryConstraint } from 'firebase/firestore';
import { doc, getDoc, setDoc, collection, getDocs, where, query, deleteField } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDv4UeL7OVLr4sWsBERcBc3_9DjkEMZ3JI",
    authDomain: "spacespeakers-c22ec.firebaseapp.com",
    projectId: "spacespeakers-c22ec",
    storageBucket: "spacespeakers-c22ec.appspot.com",
    messagingSenderId: "910239653587",
    appId: "1:910239653587:web:6684df40dfe1d648207e26",
    measurementId: "G-J0CGPXLQGF"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

export const db = getFirestore();

export const createUserCredentials = async (userCredentials, additionalData) => {
    const { uid } = userCredentials
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const createdAt = new Date();

        try {
            await setDoc(doc(db, "users", uid), {
                createdAt,
                uid,
                ...additionalData
            })

        } catch (err) {
            console.log('error creating user', err.message)
        }
    }
}

export const getTargetUserUID = async (username) => {
    let uid = null
    const userCollectionRef = collection(db, 'users');
    const queryUserToBeDisplayed = query(userCollectionRef, where("username", "==", username))
    await getDocs(queryUserToBeDisplayed).then((querySnapshot) => {
        if (querySnapshot.size === 1) {
            querySnapshot.forEach((snapshot) => {
                const data = snapshot.data()
                uid = data.uid
            })
        }
    })
    return uid
}

export const uploadUserPost = async (user, imageURL, imageTitle, caption, keywords) => {
    if (!user) return
    if (!keywords) {
        keywords = null
    }

    // Get the time of upload
    const createdAt = new Date().getTime()
    const { uid } = user

    // Get user ref
    const userRef = doc(db, 'users', uid)

    // Get post ref of user
    const postRef = doc(db, 'posts', uid)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
        setDoc(postRef, {
            [createdAt]: {
                imageURL,
                caption,
                imageTitle,
                keywords,
            }
        }).then(() => {
            console.log('posted')
            setDoc(userRef, {
                postCount: 1
            }, { merge: true })
        })
        console.log('created first post and update postcount to 1')
    } else {
        setDoc(postRef, {
            [createdAt]: {
                imageURL,
                caption,
                imageTitle,
                keywords,
            }
        }, { merge: true }).then(() => {
            getDoc(postRef).then((snapshot) => {
                return Object.keys(snapshot.data()).length
            }).then((postCount) => {
                setDoc(userRef, {
                    postCount
                }, { merge: true })
            })
        })
        console.log('created another post and update postcount (>1)')
    }
}

export const uploadComment = async (uidFrom, uidTo, post, [commentTimestamp, comment]) => {
    if (!uidFrom || !uidTo) return
    const postRef = doc(db, 'posts', uidTo)
    try {
        await setDoc(postRef, {
            [post]: {
                comment: {
                    [commentTimestamp]: [uidFrom, comment]
                }
            }
        }, { merge: true })
        console.log('Comment posted')
    } catch (err) {
        console.log('err =>', err)
    }
}

export const reactPostAction = async (uidFrom, uidTo, postKey, reactionType) => {
    if (!uidFrom || !uidTo) return
    const postRef = doc(db, 'posts', uidTo)
    await getDoc(postRef).then( async (snapshot) => {
        const data = snapshot.data()
        const post = data[postKey]
        const reaction = post.reaction
        if (reaction) {
            const reactor = reaction[uidFrom]
            if (!reactor) {
                await setDoc(postRef,
                    {
                        [postKey]: {
                            reaction: {
                                [uidFrom]: reactionType
                            }
                        }
                    }, { merge: true })
            } else {
                await setDoc(postRef,
                    {
                        [postKey]: {
                            reaction: {
                                [uidFrom]: deleteField()
                            }
                        }
                    }, { merge: true })
            }
        } else {
            await setDoc(postRef,
                {
                    [postKey]: {
                        reaction: {
                            [uidFrom]: reactionType
                        }
                    }
                }, { merge: true })
        }
    })
}

export default firebaseApp;