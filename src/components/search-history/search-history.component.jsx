import { useEffect, useState } from 'react';
import './search-history.styles.scss'
import { ReactComponent as HistorySVG } from '../../assets/history.svg';
import { ReactComponent as ClearSVG } from '../../assets/clear.svg';
import { deleteSearchHistory } from '../../firebase/firebase.init';
import { pushSearchHistory, pullSearchHistory } from '../../firebase/firebase.init';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router';

const SearchHistoryComponent = ({ timestamp, searchItem, fetchSearchHistory }) => {

    const auth = getAuth()
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        if (auth.currentUser) {
            setCurrentUser(auth.currentUser)
        }
    }, [auth])

    const handleDeleteSearchHistory = async () => {
        await deleteSearchHistory(currentUser, timestamp)
        fetchSearchHistory()
    }

    const navigateSearch = (e) => {
        navigate(`/search-data-field=${e.target.innerText}`)
        deleteSearchHistory(currentUser, timestamp)
        pushSearchHistory(currentUser, e.target.innerText, new Date().getTime())
    }

    return (
        <div className='search-history'>
            <HistorySVG className='history-svg' />
            <p className='search-history-item' onClick={(e) => { navigateSearch(e) }}>{searchItem}</p>
            <ClearSVG className='clear-svg' onClick={() => { handleDeleteSearchHistory() }} />
        </div>
    )
}

export default SearchHistoryComponent