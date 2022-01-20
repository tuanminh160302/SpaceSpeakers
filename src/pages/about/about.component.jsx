import { useEffect } from 'react'
import './about.styles.scss'
import { connect } from 'react-redux'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'

const About = ({setShowPreloader}) => {

    useEffect(() => {
        setTimeout(() => {
            setShowPreloader(false)
        }, 500)
    })

    return (
        <div className='about'>
            <h1>🌟 About SpaceSpeakers 🌟</h1>
            <ul>
                <p>🚀 Features</p>
                <li><a href="/search" target='_blank'>Search</a> for images directly from <a href='https://api.nasa.gov/' target='_blank'>NASA Image and Video Library</a></li>
                <li>Find other users or keywords to search for <a href="/search-data-field=nasa" target='_blank'>here.</a>(For mobile devices: Click on menu icon to get access to search bar)</li>
                <li><a href="/login" target='_blank'>Login/Create/Edit </a>your account</li>
                <li>Follow/Unfollow other users</li>
                <li>Share images to your profile as posts</li>
                <li>Comment on others' posts</li>
                <li>View similar posts based on keywords</li>
                <li>Delete post/comment</li>
            </ul>
            <ul>
                <p>👷 Built with</p>
                <li>Javascript</li>
                <li>ReactJS</li>
                <li>Redux</li>
                <li>Google Firebase</li>
                <li>React Easy Crop</li>
                <li>React Router</li>
                <li>GSAP</li>
                <li>HTML</li>
                <li>CSS</li>
            </ul>
            <ul>
                <p>🎉 Future Updates</p>
                <li>Realtime messaging</li>
                <li>Create blog posts</li>
            </ul>
            <ul>
                <p>🧑🏻 Dev: Steve Nguyen</p>
                <li>🔗 <a href="https://github.com/tuanminh160302" target='_blank'>Github</a></li>
                <li>🔗 <a href="" target='_blank'>Website</a></li>
                <li>🔗 <a href="https://www.linkedin.com/in/steve-nguyen-a33607153/" target='_blank'>Linkedin</a></li>
                <li>🔗 <a href="mailto:canhtuan09@gmail.com" >Email: canhtuan09@gmail.com</a></li>
            </ul>
            <ul>
                <p>✍ Test account</p>
                <li>Email: tester@test.com</li>
                <li>Password: jedi123</li>
            </ul>
            <a className='login-now' href="/login">Log in</a>
        </div>
    )
}

const mapDispatchToProps = (dispatch) => ({
    setShowPreloader: (boolean) => {dispatch(showPreloader(boolean))}
})

export default connect(null, mapDispatchToProps)(About)