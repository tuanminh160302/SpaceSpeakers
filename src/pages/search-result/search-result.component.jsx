import { useEffect, useState, Fragment } from 'react'
import './search-result.styles.scss'
import { connect } from 'react-redux'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'
import { useNavigate, useLocation } from 'react-router'
import { pullSearchResult } from '../../firebase/firebase.init'
import { fetchSuggestedUser } from '../../firebase/firebase.init'

const SearchResult = ({setShowPreloader}) => {

    const navigate = useNavigate()
    const location = useLocation()
    const pathname = location.pathname
    const [searchInput, setSearchInput] = useState()
    const [userRes, setUserRes] = useState([])
    const [keywordRes, setKeywordRes] = useState([])
    const [suggestedUser, setSuggestedUser] = useState([])

    useEffect(() => {
        setSearchInput(pathname.slice([pathname.indexOf('=') + 1]))
    }, [location])

    useEffect( async () => {
        if (searchInput) {
            await pullSearchResult(searchInput).then(([uRes, kRes]) => {
                setUserRes(uRes)
                setKeywordRes(kRes)
                setTimeout(() => {
                    setShowPreloader(false)
                }, 500)
            })
        }
    }, [searchInput, location])

    useEffect( async () => {
        await fetchSuggestedUser().then((res) => {
            setSuggestedUser(res.slice(0, 3))
        })
    }, [])

    const handleRedirectUser = async (username, uid) => {
        navigate(`/users/${username}_${uid}`)
    }

    const handleRelatedSearch = (e) => {
        const relatedKeyword = e.target.innerText
        const queryKeyword = relatedKeyword.replaceAll(" ", "%20")
        const queryFrom = 1920
        const queryTo = 2022
        const query = `search?q=${queryKeyword}&year_start=${queryFrom}&year_end=${queryTo}&media_type=image`
        navigate(`/search/${query}`)
    }

    const userResComponent = userRes.map((user, index) => {
        const {avatarURL, username, uid} = user
        return (
            <div key={index} className='user-snippets' onClick={() => {handleRedirectUser(username, uid)}}>
                <img className='user-avt' src={avatarURL} alt="" />
                <p className='username'>{username}</p>
            </div>
        )
    })

    const suggestedUserComponent = suggestedUser.map((user, index) => {
        const {avatarURL, username, uid} = user
        return (
            <div key={index} className='user-snippets' onClick={() => {handleRedirectUser(username, uid)}}>
                <img className='user-avt' src={avatarURL} alt="" />
                <p className='username'>{username}</p>
            </div>
        )
    })

    const keywordResComponent = keywordRes.map((keyword, index) => {
        return (
            <Fragment key={index}>
                <p className='keyword' onClick={(e) => {handleRelatedSearch(e)}}>{keyword}</p>
            </Fragment>
        )
    })

    return (
        <div className='search-result'>
            <div className='user-result'>
                <p className='title'>Suggested users</p>
                <div className='result-container'>
                    {suggestedUserComponent}
                </div>
                <p className='title'>Users</p>
                <div className='result-container'>
                {
                    userRes.length ? userResComponent : <p className='no-result'>No results</p>
                }
                </div>
            </div>
            <div className='post-result'>
                <p className='title'>Keywords</p>
                <div className='result-container'>
                {
                    keywordRes.length ? keywordResComponent : <p className='no-result'>No results</p>
                }
                </div>
            </div>
        </div>
    )
}

const mapDispatchToProps = (dispatch) => ({
    setShowPreloader: (boolean) => {dispatch(showPreloader(boolean))}
})

export default connect(null, mapDispatchToProps)(SearchResult)