import { useEffect, useState } from "react"

export const useFetchKeywords = (uidFrom, db, doc, getDoc, postKey, location, postOfUser) => {
    const [postKeywords, setPostKeywords] = useState([])

    useEffect(() => {
        if (uidFrom) {
            fetchPostKeywords()
        }
    }, [location, uidFrom])

    const fetchPostKeywords = async () => {
        const postRef = doc(db, 'posts', postOfUser)
        await getDoc(postRef).then((snapshot) => {
            const data = snapshot.data()
            if (data) {
                if (data[postKey].keywords) {
                    setPostKeywords(data[postKey].keywords)
                }
            }
        })
    }

    return postKeywords
}

export const useGetPostInfo = (pathname) => {
    const postOfUser = pathname.slice(7, pathname.lastIndexOf('_'))
    const postKey = pathname.slice(pathname.lastIndexOf('_') + 1)

    return [postOfUser, postKey]
}

export const useFetchPostData = (uidFrom, db, doc, getDoc, postOfUser, postKey) => {
    const [postData, setPostData] = useState([])

    useEffect(async () => {
        if (uidFrom) {
            const LOCAL_DATA = []
            const postRef = doc(db, 'posts', postOfUser)
            const userRef = doc(db, 'users', postOfUser)
            await getDoc(postRef).then(async (snapshot) => {
                const data = snapshot.data()
                if (data) {
                    if (data[postKey]) {
                        // Get timestamp
                        const timestamp = postKey
                        const time = new Date(parseInt(timestamp))
                        const timeNow = new Date()
                        let timeSpan = null
                        if (Math.floor((timeNow - time) / 86400000) === 0) {
                            timeSpan = String(Math.floor((timeNow - time) / 3600000)) + "h"
                        } else if (Math.floor((timeNow - time) / 86400000) !== 0) {
                            timeSpan = String(Math.floor((timeNow - time) / 86400000)) + "d"
                        }
                        const postImg = data[postKey].imageURL
                        const imgTitle = data[postKey].imageTitle
                        const caption = data[postKey].caption
                        LOCAL_DATA.push([postImg, imgTitle, caption, timeSpan, postKey])

                        await getDoc(userRef).then((snapshot) => {
                            const data = snapshot.data()
                            if (data) {
                                const userAvt = data.avatarURL
                                const postUsername = data.username
                                LOCAL_DATA.push([userAvt, postUsername, postOfUser])
                            }
                        })
                        setPostData(LOCAL_DATA)
                    } else {
                        setPostData([])
                    }
                }
            })
        }
    }, [uidFrom])

    return postData
}

export const useFetchSimilarPost = (uidFrom, db, doc, collection, getDocs) => {
    const [results, setResults] = useState([])

    useEffect(async () => {
        if (uidFrom) {
            let LOCAL_DATA = []
            const postCollection = collection(db, 'posts')
            await getDocs(postCollection).then((querySnapshot) => {
                querySnapshot.forEach((snapshot) => {
                    const data = snapshot.data()
                    if (data) {
                        const postKeyArr = Object.keys(data)
                        postKeyArr.forEach((postKey) => {
                            const postData = [snapshot.id, postKey, data[postKey].imageURL]
                            if (LOCAL_DATA.length < 200) {
                                LOCAL_DATA.push(postData)
                            }
                        })
                    }
                })
            })
            LOCAL_DATA.sort(() => Math.random() - 0.5);
            LOCAL_DATA = LOCAL_DATA.splice(0, 6)
            setResults(LOCAL_DATA)
        }
    }, [uidFrom])

    return results
}

export const useRelatedSearch = (navigate) => {

    const handleRelatedSearch = (e) => {
        const relatedKeyword = e.target.innerText
        const queryKeyword = relatedKeyword.replaceAll(" ", "%20")
        const queryFrom = 1920
        const queryTo = 2022
        const query = `search?q=${queryKeyword}&year_start=${queryFrom}&year_end=${queryTo}&media_type=image`
        navigate(`/search/${query}`)
    }

    return handleRelatedSearch
}