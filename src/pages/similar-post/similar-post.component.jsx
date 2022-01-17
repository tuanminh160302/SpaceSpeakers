import { useEffect, Fragment } from 'react'
import './similar-post.styles.scss'
import { useUidFrom } from '../../components/user-post/user-post.utils'
import { useGetPostInfo, useFetchKeywords, useFetchPostData, useFetchSimilarPost, useRelatedSearch } from './similar-post.utils'
import { connect } from 'react-redux'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { useNavigate, useLocation } from 'react-router'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'
import UserPost from '../../components/user-post/user-post.component'
import { ReactComponent as PostNotFoundSVG } from '../../assets/post-not-found.svg'

const SimilarPost = ({ setShowPreloader }) => {

    const auth = getAuth()
    const db = getFirestore()
    const navigate = useNavigate()
    const location = useLocation()
    let pathname = location.pathname

    const uidFrom = useUidFrom(auth, onAuthStateChanged)
    const [postOfUser, postKey] = useGetPostInfo(pathname)
    const postKeywords = useFetchKeywords(uidFrom, db, doc, getDoc, postKey, location, postOfUser)
    const postData = useFetchPostData(uidFrom, db, doc, getDoc, postOfUser, postKey)
    const results = useFetchSimilarPost(uidFrom, db, doc, collection, getDocs)
    const handleRelatedSearch = useRelatedSearch(navigate)

    useEffect(() => {
        if (postData.length && results.length) {
            setTimeout(() => {
                setShowPreloader(false)
            })
        }
    }, [postData, results])

    const preview = results.map((res, index) => {
        return (
            <div className='preview' key={index}>
                <div className='preview-content'>
                    <a href={`/posts/${res[0]}_${res[1]}`}><img className='thumbnail' src={res[2]} alt="" /></a>
                </div>
            </div>
        )
    })

    const postKeywordsComponent = postKeywords.map((keyword, index) => {
        return (
            <Fragment key={index}>
                <p className='keyword' onClick={(e) => {handleRelatedSearch(e)}}>{keyword}</p>
            </Fragment>
        )
    })

    return (
        <div className='similar-post-container'>
            {
                postData.length ?
                    <div className='original-post'>
                        {/* className, postImg, imgTitle, userAvt, postUserName, caption, timestamp, postOfUser, postKey, fetchPost */}
                        <UserPost
                            className='original'
                            postImg={postData[0][0]}
                            imgTitle={postData[0][1]}
                            caption={postData[0][2]}
                            timestamp={postData[0][3]}
                            postKey={postData[0][4]}
                            userAvt={postData[1][0]}
                            postUserName={postData[1][1]}
                            postOfUser={postData[1][2]} />

                        <hr className='original-hr' />
                        <p className='title'>Posts you might find interesting</p>
                        <div className='similar-posts'>
                            {preview}
                        </div>
                        <hr className='original-hr' />
                        <p className='title'>Related keywords</p>
                        <div className='keywords'>
                            {
                                postKeywords.length ? postKeywordsComponent : <p className='no-result'>No results</p>
                            }
                        </div>
                    </div>
                    : <div className='post-not-found-container'>
                        <PostNotFoundSVG className='post-not-found-svg' />
                        <p className='post-not-found'>This post does not exist or has been deleted by user</p>
                    </div>
            }
        </div>
    )
}

const mapDispatchToProps = (dispatch) => ({
    setShowPreloader: (boolean) => { dispatch(showPreloader(boolean)) }
})

export default connect(null, mapDispatchToProps)(SimilarPost)