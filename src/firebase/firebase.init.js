// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, QueryConstraint } from 'firebase/firestore';
import { doc, getDoc, setDoc, collection, getDocs, where, query, deleteField } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL } from 'firebase/storage'
import { getAuth, updateProfile, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
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
export const storage = getStorage()
const auth = getAuth()

export const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithRedirect(auth, provider)
}

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
    } else {
        const createdAt = new Date();

        try {
            await setDoc(doc(db, "users", uid), {
                createdAt,
                uid,
                ...additionalData
            }, {merge: true})

        } catch (err) {
            console.log('error creating user', err.message)
        }
    }
}

export const getTargetUserUID = async (username) => {
    if (!username) return
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

export const getTargetUsername = async (uid) => {
    let username = null
    if (!uid || uid.includes('/')) return username
    const userRef = doc(db, 'users', uid)
    await getDoc(userRef).then((snapshot) => {
        const data = snapshot.data()
        if (data) {
            username = data.username
        }
    })
    return username
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
    await getDoc(postRef).then(async (snapshot) => {
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

export const pullSearchResult = async (searchInput) => {
    const userCollectionRef = collection(db, 'users')
    let userRes = []
    let keywordRes = []

    // Query in user collection
    const userQuery = query(userCollectionRef, where("username", ">=", searchInput), where("username", "<=", searchInput + '\uf8ff'))
    await getDocs(userQuery).then((querySnapshot) => {
        querySnapshot.forEach((snapshot) => {
            const data = snapshot.data()
            userRes.push(data)
        })
    })

    await fetch(`https://images-api.nasa.gov/search?keywords=${searchInput}`)
        .then(res => {
            if (res.ok) {
                return res.json()
            } else {
                return false
            }
        })
        .then((res) => {
            if (res) {
                const data = res.collection.items
                data.forEach((item) => {
                    const keywords = item.data[0].keywords
                    keywords.forEach((keyword) => {
                        if (!keywordRes.includes(keyword)) {
                            keywordRes.push(keyword)
                        }
                    })
                })
            }
        })

    return [userRes, keywordRes]
}

export const uploadUserAvatar = async (user, file) => {
    if (!user) {
        return
    }
    // Set up file collection
    const fileCollection = 'avatars'

    // Get user data
    const { uid } = user
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    // Get user username
    const userName = userSnap.data().username
    const fileName = file.name

    // Set up
    const pathToFile = `users/${userName}/${fileCollection}/${fileName}`
    const fileRef = ref(storage, pathToFile)

    // Upload the file
    await uploadBytes(fileRef, file).then((snapshot) => {
        console.log("Uploaded a blob or file!");
    })
    // Update the avatar url in the database
    getDownloadURL(ref(storage, pathToFile))
        .then((url) => {
            updateProfile(user, {
                photoURL: url
            }).then(() => {
                console.log("Profile updated")
                setDoc(userRef, { avatarURL: url }, { merge: true })
                    .then(() => {
                        console.log("Successfully uploaded")
                        window.location.reload()
                    }).catch(err => console.log(err))
            })
        })
        .catch((err) => {
            console.log(err)
        })
}

export const editUserDetails = async (user, newUsername, newBio) => {
    if (!user) return

    const {uid} = user
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, 
        {
            username: newUsername,
            bio: newBio
        }, {merge: true})
    console.log('edited user details')
}

export const deleteComment = async (postOfUser, postKey, timestamp) => {
    if (!postOfUser || !postKey || !timestamp) return

    const postRef = doc(db, 'posts', postOfUser)
    await setDoc(postRef,
        {
            [postKey]: {
                comment: {
                    [timestamp]: deleteField()
                }
            }
        }, { merge: true }).then(() => {
            console.log('deteled comment')
        })
}

export const deletePost = async (uidFrom, postKey) => {
    if (!uidFrom || !postKey) return

    const postRef = doc(db, 'posts', uidFrom)
    await setDoc(postRef,
        {
            [postKey]: deleteField()
        }, {merge: true}).then(() => {
            console.log('deleted post')
        })
}

export const pushSearchHistory = async (user, searchKeyword, timestamp) => {
    if (!user) return

    const { uid } = user
    const userRef = doc(db, 'users', uid)
    await getDoc(userRef).then((snapshot) => {
        const data = snapshot.data()
        if (data) {
            const { searchHistory } = data
            if (searchHistory) {
                const allSearchItems = Object.values(searchHistory)
                if (allSearchItems.includes(searchKeyword)) {
                    const index = allSearchItems.indexOf(searchKeyword)
                    deleteSearchHistory(user, Object.keys(searchHistory)[index])
                }
            }
        }
    })

    await setDoc(userRef,
        {
            searchHistory: {
                [timestamp]: searchKeyword
            }
        }, { merge: true })
    console.log('pushed search history')
}

export const pullSearchHistory = async (user) => {
    if (!user) return

    let result = null
    const { uid } = user
    const userRef = doc(db, 'users', uid)
    await getDoc(userRef).then((snapshot) => {
        const data = snapshot.data()
        if (data) {
            const { searchHistory } = data
            if (searchHistory) {
                result = searchHistory
            }
        }
    })

    return result
}

export const deleteSearchHistory = async (user, timestamp) => {
    if (!user) return

    const { uid } = user
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef,
        {
            searchHistory: {
                [timestamp]: deleteField()
            }
        }, { merge: true })
    console.log('deleted search history')
}

export const followAction = async (uidFrom, uidTo, isFollow) => {
    if (!uidFrom || !uidTo) {
      return
    }
  
    const createdAt = new Date().getTime()
  
    const userFromRef = doc(db, 'users', uidFrom)
    const userToRef = doc(db, 'users', uidTo)
    
    let fromUser = null
    let toUser = null
    let fromAvt = null
    let toAvt = null
  
    await getDoc(userFromRef).then((snapshot) => {
      fromUser = snapshot.data().username
      if (snapshot.data().avatarURL) {
        fromAvt = snapshot.data().avatarURL
      }
    })
  
    await getDoc(userToRef).then((snapshot) => {
      toUser = snapshot.data().username
      if (snapshot.data().avatarURL) {
        toAvt = snapshot.data().avatarURL
      }
    })
  
    try {
      if (!isFollow) {
        await setDoc(userFromRef, 
          {
            socialStatus: {
              following: {
                [uidTo]: [toUser, toAvt, createdAt]
              },
            }
          }, {merge: true})
  
        await setDoc(userToRef, 
          {
            socialStatus: {
              follower: {
                [uidFrom]: [fromUser, fromAvt, createdAt]
              }
            }
          }, {merge: true})
  
        console.log('follow action pushed')
      } else if(isFollow) {
        await setDoc(userFromRef, 
          {
            socialStatus: {
              following: {
                [uidTo]: deleteField()
              }
            }
          }, {merge: true})
  
        await setDoc(userToRef, 
          {
            socialStatus: {
              follower: {
                [uidFrom]: deleteField() 
              }
            }
          }, {merge: true})
        console.log('unfollow action pushed')
      }
    } catch (err) {
      console.log(err)
    }
  }

export default firebaseApp;