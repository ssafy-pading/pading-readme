import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

// const items = [
//     <div className="relative h-1/2 bg-[#0F172A] flex items-center justify-center">
//         <div className="h-[90%] w-[93%] bg-[#1E293B] rounded-lg">

//         </div>
//     </div>,
//     <div className="relative h-1/2 bg-[#0F172A] flex items-center justify-center">
//         <div className="h-[90%] w-[93%] bg-[#1E293B] rounded-lg">

//         </div>
//     </div>, <div className="relative h-1/2 bg-[#0F172A] flex items-center justify-center">
//         <div className="h-[90%] w-[93%] bg-[#1E293B] rounded-lg">

//         </div>
//     </div>, <div className="relative h-1/2 bg-[#0F172A] flex items-center justify-center">
//         <div className="h-[90%] w-[93%] bg-[#1E293B] rounded-lg">

//         </div>
//     </div>,
// ];

interface VideoCarouselProps {
    isChatOpen: boolean;
  }
  
  const VideoCarousel: React.FC<VideoCarouselProps> = ({ isChatOpen }) => {
    const createItem = (index: number) => (
      <div className="relative h-1/2 bg-[#0F172A] flex items-center justify-center border-t-2 border-[#273654] first:border-t-0">
        <div className="h-[90%] w-[93%] bg-[#1E293B] rounded-lg">
          {/* 여기에 실제 비디오 컴포넌트가 들어갈 수 있습니다 */}
        </div>
      </div>
    );
  
    const items = isChatOpen
      ? [
          <div className="bg-slate-400 flex-1 w-full overflow-hidden flex flex-col">
            {createItem(0)}
            {createItem(1)}
          </div>,
        ]
      : [
          <div className="bg-slate-400 flex-1 w-full overflow-hidden flex flex-col">
            {createItem(0)}
            {createItem(1)}
            {createItem(2)}
            {createItem(3)}
          </div>,
        ];
  
    return (
      <AliceCarousel
        mouseTracking
        items={items}
        disableDotsControls
        disableButtonsControls
        infinite={false}
        animationDuration={400}
      />
    );
  };
  
  export default VideoCarousel;

