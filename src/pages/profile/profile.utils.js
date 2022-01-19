import { useEffect, useState } from "react";

export const useViewFullPost = (location) => {
    const [viewFullPost, setViewFullPost] = useState(false)

    useEffect(() => {
        setViewFullPost(false)
    }, [location])

    return [viewFullPost, setViewFullPost]
}

export const useHandleViewFullPost = (allPosts, UserPost, profileDetails, fetchPost, setFullPost, setViewFullPost) => {
    const handleViewFullPost = (e) => {
        e.preventDefault()
        setViewFullPost(true)
        const post = allPosts[e.target.name]

        const timestamp = Object.keys(post)[0]
        const time = new Date(parseInt(timestamp))
        const timeNow = new Date()
        let timeSpan = null
        if (Math.floor((timeNow - time) / 86400000) === 0) {
            timeSpan = String(Math.floor((timeNow - time) / 3600000)) + "h"
        } else if (Math.floor((timeNow - time) / 86400000) !== 0) {
            timeSpan = String(Math.floor((timeNow - time) / 86400000)) + "d"
        }

        const postImgURL = Object.values(post)[0].imageURL
        const postCaption = Object.values(post)[0].caption
        const imgTitle = Object.values(post)[0].imageTitle
        const postKey = Object.keys(post)[0]

        const res = <UserPost
                    postImg={postImgURL}
                    userAvt={profileDetails[2]}
                    caption={postCaption}
                    imgTitle={imgTitle}
                    postOfUser={profileDetails[0]}
                    postKey={postKey}
                    postUserName={profileDetails[1]}
                    showAllComment={false}
                    timestamp={timeSpan}
                    fetchPost={fetchPost} />
        setFullPost(res)
    }

    return handleViewFullPost
}