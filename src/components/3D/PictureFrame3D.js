import * as THREE from 'three'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCursor, Image, Text, Environment, ContactShadows } from '@react-three/drei'
import { useRouter, useParams } from 'next/navigation'
import { easing } from 'maath'
import getUuid from 'uuid-by-string'
import { useMap } from '@vis.gl/react-google-maps'
import { generateCameraFOVTransforms } from '@/common/getRandomPositions'
import { THREED_IMAGE_SHIFT, THREED_IMAGE_SIZE } from '@/constants/constants'

const GOLDENRATIO = 1.61803398875

const STREETVIEW_MIN_ZOOM = 0.8140927000158323
const STREETVIEW_MAX_ZOOM = 3
const IMAGE_NUMBER = 6;

export const PictureFrame3D = ({ artworks, setArtwork, setVisible, frameWidth = THREED_IMAGE_SIZE, frameHeight = GOLDENRATIO * THREED_IMAGE_SIZE, backgroundColor = 'transparent', showFog = false}) => {
  const map = useMap()
  const cameraDataRef = useRef(null)
  const [initialCameraConfig, setInitialCameraConfig] = useState({
    fov: 90,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  })
  
    const images = useMemo(() => {
        if (!map) return [];
        const streetView = map.getStreetView();
        const pov = streetView.getPov();
        const transforms = generateCameraFOVTransforms(IMAGE_NUMBER, pov);
        return artworks.map((artwork, index) => {
            return {
                position: transforms[index].position,
                rotation: transforms[index].rotation,
                artwork: artwork,
                onClick: () => {
                  setArtwork(artwork);
                  setVisible(true);
                }
            }
        })
    }, [map, artworks])
  // Get initial POV for camera setup
  useEffect(() => {
    if (map) {
      const streetView = map.getStreetView()
      if (streetView) {
        try {
          const pov = streetView.getPov()
          const heading = -pov.heading * Math.PI / 180
          const pitchDirection = (pov.heading > 90 +15 * THREED_IMAGE_SHIFT && currentPov.heading <= 270 + 15 * THREED_IMAGE_SHIFT) ? -1 : 1;
          const pitch = pitchDirection * pov.pitch * Math.PI / 180
          const clampedZoom = Math.min(Math.max(pov.zoom, STREETVIEW_MIN_ZOOM), STREETVIEW_MAX_ZOOM)
          const fov = 180 / Math.pow(2, clampedZoom)
          
          setInitialCameraConfig({
            fov: fov,
            position: [0, 0, 0],
            rotation: [pitch, heading, 0]
          })
        } catch (error) {
          console.warn('Could not get initial POV:', error)
        }
      }
    }
  }, [map]);

  
  
  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'row-reverse',
      }}
    >
      <Canvas 
        dpr={[1, 1.5]} 
        camera={initialCameraConfig}
        style={{ width: '100vw', height:'100vh', pointerEvents: 'none' }}
        gl={{ alpha: true }}
        onPointerMissed={(e)=>{
          e.target.style.pointerEvents = 'none';
        }}
        shadows
      >
        {backgroundColor !== 'transparent' && <color attach="background" args={[backgroundColor]} />}
        {showFog && <fog attach="fog" args={[backgroundColor || '#191920', 0, 15]} />}
        
        {/* Add lighting for shadows */}
        {/* <ambientLight intensity={0.3} />
        <directionalLight 
          position={[0, 40, 20]} 
          intensity={0.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        /> */}
        
        <group position={[0, -3, 0]}>
          <Frames 
            images={images} 
            frameWidth={frameWidth} 
            frameHeight={frameHeight} 
          />
          
          {/* Ground plane to receive shadows - angled towards audience */}
          {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -1]} receiveShadow raycast={() => null}>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial transparent opacity={0.3} />
          </mesh> */}
          
        </group>
        <Environment preset="city" />
        
        {/* Camera controller component */}
        <CameraController map={map} />
        
        {/* Data provider for external overlay */}
        <CameraDataProvider onUpdate={(data) => { cameraDataRef.current = data }} />
      </Canvas>
      
      {/* External overlay with frame dimensions */}
      <FrameOverlay 
        images={images}
        cameraDataRef={cameraDataRef}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
      />
    </div>
  )
}

// Component to handle camera updates within the Canvas
function CameraController({ map }) {
  const { camera } = useThree()
  const lastPovRef = useRef(null)
  
  useFrame(() => {
    if (!map) return
    
    try {
      const streetView = map.getStreetView()
      if (!streetView) return
      
      const currentPov = streetView.getPov()
      
      // Only update if POV has actually changed to avoid unnecessary calculations
      const lastPov = lastPovRef.current
      if (lastPov && 
          Math.abs(lastPov.heading - currentPov.heading) < 0.001 &&
          Math.abs(lastPov.pitch - currentPov.pitch) < 0.001 &&
          Math.abs(lastPov.zoom - currentPov.zoom) < 0.001) {
        return
      }
      
      lastPovRef.current = { ...currentPov }
      
      const heading = -1 * currentPov.heading * Math.PI / 180
      // !!! Add pitchDirection to make sure everything in front of users make sense, forget about everything behind them
      const pitchDirection = (currentPov.heading > 90 + 10 * THREED_IMAGE_SHIFT  && currentPov.heading <= 270 + 10 * THREED_IMAGE_SHIFT ) ? -1 : 1;
      const pitch = pitchDirection * currentPov.pitch * Math.PI / 180
      const clampedZoom = Math.min(Math.max(currentPov.zoom, STREETVIEW_MIN_ZOOM), STREETVIEW_MAX_ZOOM)
      const fov = 180 / Math.pow(2, clampedZoom)
      
      // Update camera rotation
      camera.rotation.set(pitch, heading, 0)
      
      // Update camera FOV
      camera.fov = fov
      camera.updateProjectionMatrix()
    } catch (error) {
      // Silently handle cases where street view is not ready
      // console.warn('Could not get POV in frame:', error)
    }
  })
  
  return null
}

function Frames({ images, frameWidth = 1, frameHeight = GOLDENRATIO, q = new THREE.Quaternion(), p = new THREE.Vector3() }) {
  const ref = useRef()
  const clicked = useRef()
  const router = useRouter()
  const params = useParams()
  const selectedId = params?.id

  useEffect(() => {
    clicked.current = ref.current.getObjectByName(selectedId)
    if (clicked.current) {
      clicked.current.parent.updateWorldMatrix(true, true)
      clicked.current.parent.localToWorld(p.set(0, frameHeight / 2, 1.25))
      clicked.current.parent.getWorldQuaternion(q)
    } else {
      p.set(0, 0, 5.5)
      q.identity()
    }
  }, [selectedId, frameHeight])

  // Only use easing for frame selection, not for pov changes
  useFrame((state, dt) => {
    if (clicked.current) {
      // Only apply easing when focusing on a specific frame
      easing.damp3(state.camera.position, p, 0.4, dt)
      easing.dampQ(state.camera.quaternion, q, 0.4, dt)
    }
  })

  return (
    <group
      ref={ref}
    >
      {images.map((props, index) => {
        return(<Frame 
          key={getUuid(props.artwork?.title + props.artwork?.id)} 
          {...props} 
          selectedId={selectedId} 
          frameWidth={frameWidth} 
          frameHeight={frameHeight}
          onClick={props.onClick}
        />)
      })}
    </group>
  )
}

function Frame({ artwork, selectedId, frameWidth = 1, frameHeight = GOLDENRATIO, c = new THREE.Color(), onClick = null, ...props }) {
  const image = useRef()
  const frame = useRef()
  const [hovered, hover] = useState(false)
  const [rnd, setRnd] = useState(0)
  const [mounted, setMounted] = useState(false)
  const name = getUuid(artwork?.title + artwork?.id)
  const isActive = selectedId === name

  // Set random value only on client side after mount
  useEffect(() => {
    setRnd(Math.random())
    setMounted(true)
  }, [])
  
  useCursor(hovered)
  
  useFrame((state, dt) => {
    if (image.current?.material && mounted) {
      image.current.material.zoom = 2 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 2
    }
    if (image.current) {
      easing.damp3(image.current.scale, [0.85 * (!isActive && hovered ? 0.85 : 1), 0.9 * (!isActive && hovered ? 0.905 : 1), 1], 0.1, dt)
    }
    if (frame.current?.material) {
      easing.dampC(frame.current.material.color, hovered ? 'orange' : 'white', 0.1, dt)
    }
  })

  return (
    <group {...props}>
      <mesh
        name={name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        onClick={onClick}
        scale={[frameWidth, frameHeight, 0.05]}
        position={[0, frameHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry />
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2} />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={artwork?.validImage} />
      </mesh>
      <Text maxWidth={0.1} anchorX="left" anchorY="top" position={[0.55, GOLDENRATIO, 0]} fontSize={0.025}>
        {name.split('-').join(' ')}
      </Text>
    </group>
  )
}

// Simple data provider inside Canvas - throttled to avoid infinite loops
function CameraDataProvider({ onUpdate }) {
  const { camera, scene } = useThree()
  const lastUpdateRef = useRef(0)
  
  useFrame(() => {
    const now = performance.now()
    // Only update every 32ms (~30fps) to avoid infinite loops
    if (now - lastUpdateRef.current > 32) {
      lastUpdateRef.current = now
      onUpdate({ camera, scene })
    }
  })
  
  return null
}

function FrameOverlay({ images, cameraDataRef, frameWidth = 1, frameHeight = GOLDENRATIO }) {
  const [framePositions, setFramePositions] = useState([])
  
  useEffect(() => {
    let animationId;
    
    const updatePositions = () => {
      const currentCameraData = cameraDataRef.current
      if (!currentCameraData) {
        animationId = requestAnimationFrame(updatePositions)
        return
      }
      
      const { camera, scene } = currentCameraData
      const positions = []
      
      images.forEach((imageProps, index) => {
        const frameObject = scene.getObjectByName(getUuid(imageProps.artwork?.title + imageProps.artwork?.id))
        if (frameObject) {
          try {
            // Get the frame's world matrix
            frameObject.updateMatrixWorld(true)
            
            // Focus only on the front face of the frame for more accurate clickable area
            // BoxGeometry creates a box from -0.5 to +0.5 in each dimension by default
            const corners = [
              new THREE.Vector3(-0.5, -0.5, 0.5), // Bottom left front
              new THREE.Vector3(0.5, -0.5, 0.5),  // Bottom right front  
              new THREE.Vector3(0.5, 0.5, 0.5),   // Top right front
              new THREE.Vector3(-0.5, 0.5, 0.5),  // Top left front
            ]
            
            // Transform corners to world space
            const worldCorners = corners.map(corner => {
              corner.applyMatrix4(frameObject.matrixWorld)
              return corner
            })
            
            // Project all corners to screen space
            const screenCorners = worldCorners.map(worldCorner => {
              const screenPos = worldCorner.clone().project(camera)
              
              // Convert normalized device coordinates to screen pixels
              const x = ((screenPos.x + 1) / 2) * window.innerWidth
              const y = ((1 - screenPos.y) / 2) * window.innerHeight
              
              return { x, y, z: screenPos.z }
            })
            
            // Check if any corner is behind the camera
            const behindCamera = screenCorners.some(corner => corner.z > 1)
            if (behindCamera) return
            
            // Calculate the bounding box of the projected corners
            const minX = Math.min(...screenCorners.map(c => c.x))
            const maxX = Math.max(...screenCorners.map(c => c.x))
            const minY = Math.min(...screenCorners.map(c => c.y))
            const maxY = Math.max(...screenCorners.map(c => c.y))
            
            const screenWidth = maxX - minX
            const screenHeight = maxY - minY
            
            // Only add frames that are actually visible on screen
            if (minX < window.innerWidth && maxX > 0 && minY < window.innerHeight && maxY > 0) {
              positions.push({
                x: minX,
                y: minY,
                width: screenWidth,
                height: screenHeight,
                onClick: imageProps.onClick,
                index: index
              })
            }
          } catch (error) {
            console.error('Error calculating frame position:', error)
          }
        }
      })
      
      setFramePositions(positions)
      animationId = requestAnimationFrame(updatePositions)
    }
    
    updatePositions()
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [images, frameWidth, frameHeight, cameraDataRef]) // Include cameraDataRef in dependencies
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 10
    }}>
      {framePositions.map((pos) => (
        <div
          key={pos.index}
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`,
            pointerEvents: 'auto',
            cursor: 'pointer',
            background: 'transparent',
          }}
          onClick={pos.onClick}
        />
      ))}
    </div>
  )
}