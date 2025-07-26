/**
 * Generates objects circled around camera position, all facing the camera
 * Takes into account the camera's POV rotation from street view
 * @param {number} count - Number of objects to generate
 * @param {Object} pov - Street view POV data {heading, pitch, zoom}
 * @param {Object} options - Configuration options
 * @param {number} options.radius - Distance from camera (default: 5)
 * @param {number} options.positionNoise - Random position offset (default: 0.3)
 * @param {number} options.rotationNoise - Random rotation offset in radians (default: 0.1)
 * @param {number} options.zVariation - Small z-axis variation (default: 0.2)
 * @returns {Array} Array of {position: [x,y,z], rotation: [x,y,z]} objects
 */
function generateCircularTransforms(count, pov, options = {}) {
  const {
    radius = 5,
    positionNoise = 0.3,
    rotationNoise = 0.1,
    zVariation = 0.2
  } = options
  
  // Camera is at [0, 0, 0] with rotation based on POV
  const cameraPosition = [0, 0, 0]
  const cameraHeading = -pov.heading * Math.PI / 180
  const cameraPitch = pov.pitch * Math.PI / 180
  
  const transforms = []
  const angleStep = (Math.PI * 2) / count // Equal spacing around circle
  
  for (let i = 0; i < count; i++) {
    // Base angle for this object around the camera
    const baseAngle = i * angleStep
    
    // Position objects in circle around camera at [0, 0, 0]
    const baseX = radius * Math.cos(baseAngle)
    const baseY = radius * Math.sin(baseAngle) 
    const baseZ = 0 // Keep close to camera's z-level
    
    // Add mild perturbations to position
    const position = [
      baseX + (Math.random() - 0.5) * positionNoise,
      baseY + (Math.random() - 0.5) * positionNoise,
      baseZ + (Math.random() - 0.5) * zVariation
    ]
    
    // Calculate rotation to face camera at [0, 0, 0]
    // Each object should look towards the center (camera position)
    const lookAtAngle = Math.atan2(
      cameraPosition[1] - position[1], // dy
      cameraPosition[0] - position[0]  // dx
    )
    
    // Object rotation to face camera + small perturbations
    const rotation = [
      (Math.random() - 0.5) * rotationNoise, // Small x tilt
      lookAtAngle + (Math.random() - 0.5) * rotationNoise, // Face camera + noise
      0 // Keep z rotation at 0
    ]
    
    transforms.push({ position, rotation })
  }
  
  return transforms
}

/**
 * Alternative: Objects positioned in camera's field of view
 * Places objects in a circle that's oriented towards camera's viewing direction
 */
function generateCameraFOVTransforms(count, pov, options = {}) {
  const {
    radius = 5,
    distance = 0, // How far in front of camera
    positionNoise = 0,
    rotationNoise = 0
  } = options
  
  const cameraHeading = -pov.heading * Math.PI / 180
  const cameraPitch = pov.pitch * Math.PI / 180
  
  // Calculate camera's forward direction
  const forwardX = Math.cos(cameraPitch) * Math.cos(cameraHeading)
  const forwardY = Math.cos(cameraPitch) * Math.sin(cameraHeading)
  const forwardZ = Math.sin(cameraPitch)
  
  // Center point in front of camera
  const centerX = distance * forwardX
  const centerY = distance * forwardY
  const centerZ = distance * forwardZ
  
  const transforms = []
  const angleStep = (Math.PI * 2) / count
  const halfCount = count / 2;
  for (let i = 0; i < halfCount; i++) {
    const position = [6*i/(halfCount-1), 0, 0]
    const rotation = [0, 0, 0];
    transforms.push({ position, rotation })
  }
  for (let i = 0; i < halfCount; i++) {
    const position = [-6*i/(halfCount-1), 0, 10]
    const rotation = [0, Math.PI + 0.5 * Math.random() - 0.25, 0];
    transforms.push({ position, rotation })
  }
  console.log(transforms);
  return transforms;
}

export { generateCircularTransforms, generateCameraFOVTransforms }

// Usage examples:
/*
// Get POV from street view
const pov = streetView.getPov()

// Objects in circle around camera at [0,0,0], all facing camera
const transforms = generateCircularTransforms(10, pov, {
  radius: 6,
  positionNoise: 0.2
})

// Objects positioned in camera's field of view
const fovTransforms = generateCameraFOVTransforms(8, pov, {
  radius: 3,
  distance: 10
})

// In your React component:
function MyScene() {
  const [transforms, setTransforms] = useState([])
  
  useEffect(() => {
    if (map) {
      const streetView = map.getStreetView()
      const pov = streetView.getPov()
      setTransforms(generateCircularTransforms(12, pov))
    }
  }, [map])
  
  return (
    <>
      {transforms.map((transform, index) => (
        <mesh key={index} position={transform.position} rotation={transform.rotation}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      ))}
    </>
  )
}
*/