import { useNavigate } from "react-router"

const navigate = useNavigate()

export const handleRelatedSearch = (e) => {
    const relatedKeyword = e.target.innerText
    const queryKeyword = relatedKeyword.replaceAll(" ", "%20")
    const queryFrom = 1920
    const queryTo = 2022
    const query = `search?q=${queryKeyword}&year_start=${queryFrom}&year_end=${queryTo}&media_type=image`
    navigate(`/search/${query}`)
}