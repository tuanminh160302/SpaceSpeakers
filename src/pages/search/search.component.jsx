import { useEffect, useState, Fragment } from 'react';
import './search.styles.scss';
import { connect } from 'react-redux';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { setSearchData } from '../../redux/searchData/searchData.actions';
import { useNavigate, useLocation } from 'react-router';
import { ReactComponent as CreateSVG } from '../../assets/create.svg'
import { ReactComponent as TickSVG } from '../../assets/tick.svg'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { uploadUserPost } from '../../firebase/firebase.init';
import { getTargetUsername } from '../../firebase/firebase.init';

const Search = ({ showPreloader, setShowPreloader, keyword, from, to, setSearchData }) => {

    const nasaEndpoint = 'https://images-api.nasa.gov/'
    // const nasaApiKey = process.env.REACT_APP_NASA_API_KEY // dirty secret

    const auth = getAuth()
    const navigate = useNavigate()
    const location = useLocation()
    let locationSearch = location.search
    const [searchTarget, setSearchTarget] = useState()
    const [resultsExist, setResultsExist] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [allResults, setAllResults] = useState([])
    const [showPost, setShowPost] = useState(false)
    const [postData, setPostData] = useState(null)
    const [showSharePortal, setShowSharePortal] = useState(false)
    const [caption, setCaption] = useState(null)
    const [successPost, setSuccessPost] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [username, setUsername] = useState(null)
    const [postImgZoom, setPostImgZoom] = useState(false)
    const [zoomedImg, setZoomedImg] = useState()

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(auth.currentUser)
                getTargetUsername(auth.currentUser.uid).then((res) => {
                    setUsername(res)
                })
            } else {
                setCurrentUser(null)
            }
        })
    }, [auth])

    useEffect(() => {
        setShowResult(false)
        if (locationSearch !== '') {
            const searchArray = locationSearch.split('')
            const queryKeyword = searchArray.slice(3, searchArray.indexOf('&')).join('')
            searchArray.splice(0, searchArray.indexOf('&') + 12)
            const queryFrom = searchArray.slice(0, searchArray.indexOf('&')).join('')
            searchArray.splice(0, searchArray.indexOf('&') + 10)
            const queryTo = searchArray.slice(0, searchArray.indexOf('&')).join('')
            setSearchTarget(queryKeyword.replaceAll("%20", " "))

            // Fetch Data
            fetch(`${nasaEndpoint}search?q=${queryKeyword}&year_start=${queryFrom}&year_end=${queryTo}&media_type=image`)
                .then(res => res.ok && res.json())
                .then(data => {
                    setTimeout(() => {
                        setShowPreloader(false)
                    }, 500)
                    if (data.collection) {
                        const items = data.collection.items
                        const itemsDetails = items.map((item) => {
                            const itemData = item.data[0]
                            const itemImgURLS = item.href
                            const itemPreview = item.links[0].href
                            return [itemData, itemImgURLS, itemPreview]
                        })
                        // console.log(itemsDetails)
                        itemsDetails.length ? setResultsExist(true) : setResultsExist(false)
                        itemsDetails.length ? setAllResults(itemsDetails) : setAllResults([])
                    }
                })
            setShowResult(true)
        } else {
            setResultsExist(false)
            setAllResults([])
            setTimeout(() => {
                setShowPreloader(false)
            }, 500)
        }

        handleExitViewPost()
    }, [location])

    const handleViewPost = (e) => {
        if (e.target) {
            document.body.style.overflowY = 'hidden'
            const targetIndex = e.target.id
            const targetData = allResults[targetIndex]
            setPostData(targetData)
            setShowPost(true)
        }
    }

    const handleExitViewPost = () => {
        setShowPost(false)
        setPostData(null)
        setShowSharePortal(false)
        setSuccessPost(false)
        document.body.style.overflowY = 'visible'
    }

    const preview = allResults.map((result, index) => {
        return (
            <Fragment key={index}>
                <div className='preview'>
                    <div className='preview-content'>
                        <img className='thumbnail' id={index} src={result[2]} alt="" onClick={(e) => { handleViewPost(e) }} />
                    </div>
                </div>
            </Fragment>
        )
    })

    // Dirty work
    const handleInputChange = (e) => {
        e.preventDefault();
        setSearchData({
            [e.target.name]: e.target.value
        })
    }

    // ?api_key=9wzXezszXGXN8AEBjZaTcYmxhD0bcBAf4NAhZ2wa

    const handleSearch = (e) => {
        e.preventDefault();
        const queryKeyword = keyword.replaceAll(" ", "%20")
        let queryFrom = null
        let queryTo = null
        if (from != '') {
            queryFrom = from.replaceAll(" ", "%20")
        } else {
            queryFrom = 1920
        }
        if (to != '') {
            queryTo = to.replaceAll(" ", "%20")
        } else {
            queryTo = 2022
        }
        const query = `search?q=${queryKeyword}&year_start=${queryFrom}&year_end=${queryTo}&media_type=image`
        navigate(`/search/${query}`)
    }

    const handleRelatedSearch = (e) => {
        const relatedKeyword = e.target.innerText
        const queryKeyword = relatedKeyword.replaceAll(" ", "%20")
        const queryFrom = 1920
        const queryTo = 2022
        const query = `search?q=${queryKeyword}&year_start=${queryFrom}&year_end=${queryTo}&media_type=image`
        navigate(`/search/${query}`)
    }

    const handleSharePostImg = () => {
        setShowSharePortal(true)
    }

    const handleExitSharePortal = () => {
        setShowSharePortal(false)
        setCaption(null)
    }

    const handleTextAreaChange = (e) => {
        e.preventDefault()
        setCaption(e.target.value)
    }

    const handleSharePostAction = async () => {
        let keywords = null
        if (postData[0].keywords) {
            keywords = postData[0].keywords.map((keyword) => {
                return keyword.toLowerCase()
            })
        }
        await uploadUserPost(currentUser, postData[2], postData[0].title, caption, keywords).then(() => {
            console.log('successfully uploaded')
            setSuccessPost(true)
            handleExitSharePortal()
        })
    }

    const handleZoomImg = (e) => {
        e.preventDefault()

        setZoomedImg(e.target.src)
        setPostImgZoom(true)
    }

    return (
        <div className='search'>
            <form className='search-form' onSubmit={(e) => { handleSearch(e) }}>
                <input className='key-input' name='keyword' type="text" value={keyword} placeholder='What do you want to see?' required onChange={(e) => { handleInputChange(e) }} />
                <div className='year-input'>
                    <p>From (year)</p>
                    <input className='from' name='from' type="text" value={from} onChange={(e) => { handleInputChange(e) }} />
                    <p>To (year)</p>
                    <input className='to' name='to' type="text" value={to} onChange={(e) => { handleInputChange(e) }} />
                </div>
                <button className='submit'>Search</button>
            </form>
            {
                    postImgZoom ?
                        <div className='post-img-zoom-container'>
                            <div className='exit-post-img-zoom' onClick={() => { setPostImgZoom(false); setZoomedImg() }}></div>
                            <img className='post-img-zoom' src={zoomedImg} alt="" />
                        </div> : null
            }
            {
                showResult ? <div className='results'>
                    {!resultsExist ?
                        <p className='title'>Based on your selections, no results were found</p> :
                        <>
                            <p className='title'>Showing {allResults.length} results for"{searchTarget}":</p>
                            <div className='preview-container'>
                                {preview}
                            </div>
                        </>
                    }
                </div> : null
            }
            {
                showPost ?
                    <div className='post'>
                        <div className='exit-post' onClick={() => { handleExitViewPost() }}></div>
                        <div className='post-container'>
                            <div className='img-container'>
                                <p className='title'>{postData[0].title}</p>
                                <img className='post-img' src={postData[2]} alt="" onClick={(e) => {handleZoomImg(e)}}/>
                                <p className='nasa-id'>{`Nasa ID: ${postData[0].nasa_id}`}</p>
                                <div className='interact-svg'>
                                    {
                                        !successPost ?
                                            <>
                                                {
                                                    currentUser ?
                                                        <>
                                                            <CreateSVG className='create-svg' onClick={() => { handleSharePostImg() }} />
                                                            <p className='create-text' onClick={() => { handleSharePostImg() }} >Click here to share this to your profile</p>
                                                        </>
                                                        : <a className='unauth-create' href='/login'>Sign in to share this photo to your profile</a>
                                                }
                                            </> :
                                            <>
                                                <a className='create-text-success' href={`/users/${username}_${currentUser.uid}`}>Succesfully posted to your profile</a>
                                            </>
                                    }
                                </div>
                            </div>
                            <div className='post-content'>
                                <p className='title'>Description</p>
                                <p className='details description-details'>{postData[0].description}</p>
                                <p className='title'>Center</p>
                                <p className='details'>{postData[0].center}</p>
                                <p className='title'>Date Created</p>
                                <p className='details'>{postData[0].date_created}</p>
                                <p className='title related'>Related Keywords</p>
                                {postData[0].keywords ? <div className='keywords'>
                                    {
                                        postData[0].keywords.map((keyword, index) => {
                                            return (
                                                <p key={index} className='keyword' onClick={(e) => { handleRelatedSearch(e) }}>{keyword}</p>
                                            )
                                        })
                                    }</div> : <p className='details'>None</p>}
                            </div>
                        </div>
                    </div> : null
            }

            {
                showSharePortal ?
                    <div className='share-portal-container'>
                        <div className='exit-share-portal' onClick={() => { handleExitSharePortal() }}></div>
                        <div className='share-portal'>
                            <p className='caption-prompt'>Say something about this image...</p>
                            <textarea className='caption-input' name="caption-input" onChange={(e) => { handleTextAreaChange(e) }}></textarea>
                            <button className='share-button' onClick={() => { handleExitSharePortal() }}>Cancel</button>
                            <button className='share-button share' onClick={() => { handleSharePostAction() }}>Post</button>
                        </div>
                    </div> :
                    null
            }
        </div>
    )
}

const mapStateToProps = ({ showPreloader, searchData }) => ({
    showPreloader: showPreloader.showPreloader,
    keyword: searchData.keyword,
    from: searchData.from,
    to: searchData.to,
})

const mapDispatchToProps = (dispatch) => ({
    setShowPreloader: (boolean) => { dispatch(showPreloader(boolean)) },
    setSearchData: (valueObject) => { dispatch(setSearchData(valueObject)) }
})

export default connect(mapStateToProps, mapDispatchToProps)(Search);