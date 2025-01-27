import { Page } from "./home/home"
import  Page_Image  from "./home_images/images"
import Page_Info from "./home_Into/home_Info"

export default async function Home() {
    return <div className='w-full   text-white font-bold'>
      <Page />
      <Page_Image />
      <Page_Info />
    </div>
}