import './user-post.styles.scss'
import {ReactComponent as HeartSVG} from '../../assets/heart.svg'

const UserPost = ({className, postImg, userAvt, caption, timestamp, numLike}) => {
    return (
        <div className={`${className} post-component`}>
            <div className='post-details'>
                <div className='user-content'>
                    <img src={userAvt} alt="" />
                    <div className='caption-details'>
                        <p className='caption'>{caption}</p>
                        <p className='timestamp['>{timestamp}</p>
                    </div>
                    <p className='num-like'>{numLike}</p>
                    <HeartSVG className='like-btn'/>
                </div>
                <img className='post-img' src={postImg} alt="" />
            </div>
            <div className='comment-section'>
                <p className='title'>Comment</p>
            </div>
        </div>
    )
}

export default UserPost