import {Button} from '../components/ui/button'
import Navbar from './Navbar'

function Homepage() {
  return (
    <section className='border'>
        <Navbar/>
        <main className='p-2 py-5'>
            <div className='border-2 border-blue-500 h-40 w-36 p-4 text-center flex justify-center items-center rounded cursor-pointer'>
                <span className='text-gray-500 text-center'>Blank document</span>
            </div>
            <div className='mt-5'>
                <h1 className='text-lg pb-2 border-b-2'>Recents</h1>
                <div className='p-2'>
                    <Recentdocs/>
                    <Recentdocs/>
                    <Recentdocs/>
                    <Recentdocs/>
                    <Recentdocs/>
                </div>
                <p className='text-blue-500 text-center cursor-pointer'>More...</p>
            </div>
        </main>
    </section>
  )
}

function Recentdocs(){
    return (
        <div className='flex justify-between items-center p-2 bg-slate-100 rounded mb-3'>
            <span>Document name</span>
            <div className='flex justify-center items-center gap-5'>
                <Button variant={'outline'}>Open</Button>
                <Button variant={'destructive'}>Delete</Button>
            </div>
        </div>
    )
}

export default Homepage