import { useEffect } from 'react';
import './landing-page.styles.scss';
import landingImg from '../../assets/home-img.jpg'
import { connect } from 'react-redux';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { useNavigate } from 'react-router';

const LandingPage = ({showPreloader, setShowPreloader}) => {

    const navigate = useNavigate()

    useEffect(() => {
        setTimeout(() => {
            setShowPreloader(false)
        }, 500)
    })

    return (
        <div className='landing'>
            <div className='intro'>
                <img className='intro-img' src={landingImg} alt="" />
                <div className='intro-content'>
                    <p className='title'>Let's be honest</p>
                    <p className='description'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.  It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p>
                    <button className='explore' onClick={() => {navigate('/search')}}>Search images</button>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = ({showPreloader}) => ({
    showPreloader: showPreloader.showPreloader
})

const mapDispatchToProps = (dispatch) => ({
    setShowPreloader: (boolean) => {dispatch(showPreloader(boolean))}
})

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);