import { useEffect, useState, Fragment } from 'react';
import './search.styles.scss';
import { connect } from 'react-redux';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { setSearchData } from '../../redux/searchData/searchData.actions';
import { useNavigate, useLocation } from 'react-router';

const Search = ({ showPreloader, setShowPreloader, keyword, from, to, setSearchData }) => {

    const nasaEndpoint = process.env.REACT_APP_NASA_ENDPOINT
    // const nasaApiKey = process.env.REACT_APP_NASA_API_KEY // dirty secret

    const navigate = useNavigate()
    const location = useLocation()
    let locationSearch = location.search

    const [showResults, setShowResults] = useState(false)
    const [searchTarget, setSearchTarget] = useState()
    const [resultsExist, setResultsExist] = useState(false)
    const [allResults, setAllResults] = useState([])
    const [showPost, setShowPost] = useState(false)
    const [postData, setPostData] = useState(null)

    useEffect(() => {
        setTimeout(() => {
            // setShowPreloader(false)
        })

        if (locationSearch !== '') {
            const searchArray = locationSearch.split('')
            const queryKeyword = searchArray.slice(3, searchArray.indexOf('&')).join('')
            searchArray.splice(0, searchArray.indexOf('&') + 12)
            const queryFrom = searchArray.slice(0, searchArray.indexOf('&')).join('')
            searchArray.splice(0, searchArray.indexOf('&') + 10)
            const queryTo = searchArray.slice(0, searchArray.indexOf('&')).join('')
            console.log(queryKeyword, queryFrom, queryTo)
            setSearchTarget(queryKeyword.replaceAll("%20", " "))

            // Fetch Data
            fetch(`${nasaEndpoint}search?q=${queryKeyword}&year_start=${queryFrom}&year_end=${queryTo}&media_type=image`)
                .then(res => res.ok && res.json())
                .then(data => {
                    setTimeout(() => {
                        setShowPreloader(false)
                    }, 500)
                    const items = data.collection.items
                    console.log(data)
                    const itemsDetails = items.map((item) => {
                        const itemData = item.data[0]
                        const itemImgURLS = item.href
                        const itemPreview = item.links[0].href
                        return [itemData, itemImgURLS, itemPreview]
                    })
                    // console.log(itemsDetails)
                    setShowResults(true)
                    itemsDetails.length ? setResultsExist(true) : setResultsExist(false)
                    itemsDetails.length ? setAllResults(itemsDetails) : setAllResults([])
                })
        } else {
            setShowResults(false)
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
            console.log(targetData)
            setPostData(targetData)
            setShowPost(true)
        }
    }

    const handleExitViewPost = () => {
        setShowPost(false)
        setPostData(null)
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

    return (
        <div className='search'>
            <form className='search' onSubmit={(e) => { handleSearch(e) }}>
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
                showResults ?
                    <div className='results'>
                        {!resultsExist ?
                            <p className='title'>No results for "{searchTarget}"</p> :
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
                                <img className='post-img' src={postData[2]} alt="" />
                                <p className='nasa-id'>{`Nasa ID: ${postData[0].nasa_id}`}</p>
                            </div>
                            <div className='post-content'>
                                <p className='title'>Description</p>
                                <p className='details description-details'>{postData[0].description}</p>
                                <p className='title'>Center</p>
                                <p className='details'>{postData[0].center}</p>
                                <p className='title'>Date Created</p>
                                <p className='details'>{postData[0].date_created}</p>
                                <p className='title related'>Related Keywords</p>
                                {postData[0].keywords ? <div className='keywords'>{
                                    postData[0].keywords.map((keyword, index) => {
                                        return (
                                            <p key={index} className='keyword' onClick={(e) => {handleRelatedSearch(e)}}>{keyword}</p>
                                        )
                                    })
                                }</div> : <p className='details'>None</p>}
                            </div>
                        </div>
                    </div> : null
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