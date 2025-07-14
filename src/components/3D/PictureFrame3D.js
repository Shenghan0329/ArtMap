import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCursor, Image, Text, Environment, ContactShadows } from '@react-three/drei'
import { useRouter, useParams } from 'next/navigation'
import { easing } from 'maath'
import getUuid from 'uuid-by-string'

const GOLDENRATIO = 1.61803398875

export const PictureFrame3D = ({ images, frameWidth = 1, frameHeight = GOLDENRATIO, backgroundColor = 'transparent', showFog = false }) => (
  <div style={{ 
    width: '100vw', 
    height: '100vh', 
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1
  }}>
    <Canvas 
      dpr={[1, 1.5]} 
      camera={{ fov: 70, position: [0, 2, 15] }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true }}
      shadows // Enable shadows
    >
      {backgroundColor !== 'transparent' && <color attach="background" args={[backgroundColor]} />}
      {showFog && <fog attach="fog" args={[backgroundColor || '#191920', 0, 15]} />}
      
      {/* Add lighting for shadows */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[0, 10, -5]} 
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <group position={[0, -0.5, -5]}>
        <Frames images={images} frameWidth={frameWidth} frameHeight={frameHeight} />
        
        {/* Ground plane to receive shadows - angled towards audience */}
        <mesh rotation={[-Math.PI / 3, 0, 0]} position={[0, -1.5, 2]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.4} />
        </mesh>
        
        {/* Alternative: ContactShadows (comment out the mesh above to use this) */}
        {/*
        <ContactShadows
          rotation-x={Math.PI / 2}
          position={[0, -0.8, 0]}
          opacity={0.6}
          width={10}
          height={10}
          blur={2}
          far={4}
          color="#000000"
        />
        */}
      </group>
      <Environment preset="city" />
    </Canvas>
  </div>
)

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

  useFrame((state, dt) => {
    easing.damp3(state.camera.position, p, 0.4, dt)
    easing.dampQ(state.camera.quaternion, q, 0.4, dt)
  })

  const handleClick = (e) => {
    e.stopPropagation()
    const objectName = e.object.name
    if (clicked.current === e.object) {
      
    } else {
      // Navigate to specific frame
      router.push(`/gallery/${objectName}`)
    }
  }

  const handlePointerMissed = () => {
    router.push('/gallery')
  }

  return (
    <group
      ref={ref}
      onClick={handleClick}
    >
      {images.map((props) => (
        <Frame 
          key={props.url} 
          {...props} 
          selectedId={selectedId} 
          frameWidth={frameWidth} 
          frameHeight={frameHeight} 
        />
      ))}
    </group>
  )
}

function Frame({ url, selectedId, c = new THREE.Color(), ...props }) {
  const image = useRef()
  const frame = useRef()
  const [hovered, hover] = useState(false)
  const [rnd, setRnd] = useState(0)
  const [mounted, setMounted] = useState(false)
  const name = getUuid(url)
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
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry />
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2} />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={url} />
      </mesh>
      <Text maxWidth={0.1} anchorX="left" anchorY="top" position={[0.55, GOLDENRATIO, 0]} fontSize={0.025}>
        {name.split('-').join(' ')}
      </Text>
    </group>
  )
}