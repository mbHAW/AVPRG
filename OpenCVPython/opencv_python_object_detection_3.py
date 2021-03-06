from asyncio.tasks import sleep
from asyncio.windows_events import NULL
import cv2
import numpy as np

def nothing(x):
    pass

isRunning = False
coords = NULL

def run():
    
    cap = cv2.VideoCapture(0)
    if cap.isOpened() == False:
        print("Error in opening video stream or file")

    print(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    print(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    # new dimension
    cap.set(3, 1280)
    cap.set(4, 720)
    print(cap.get(3))
    print(cap.get(4))

    cv2.namedWindow("Tracking")
    cv2.createTrackbar("LH", "Tracking", 0, 255, nothing)   # at day 0   # at night 0
    cv2.createTrackbar("LS", "Tracking", 112, 255, nothing) # at day 100 # at night 112
    cv2.createTrackbar("LV", "Tracking", 24, 255, nothing)  # at day 115 # at night 24
    cv2.createTrackbar("UH", "Tracking", 188, 255, nothing) # at day 225 # at night 188
    cv2.createTrackbar("US", "Tracking", 255, 255, nothing) # at day 225 # at night 255
    cv2.createTrackbar("UV", "Tracking", 126, 255, nothing) # at day 225 # at night 126
    cv2.createTrackbar("BL", "Tracking", 20, 50, nothing)   # must be above 0

    while True:
        isRunning = True
        _, frame = cap.read()

        # Use Flip code 0 to flip vertically
        frame = cv2.flip(frame, 1)

        frame_orig = frame.copy()

        blur = cv2.getTrackbarPos("BL", "Tracking")
        if blur > 0:
            frame = cv2.blur(frame, (blur, blur))

        #---------------------------------

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        l_h = cv2.getTrackbarPos("LH", "Tracking")
        l_s = cv2.getTrackbarPos("LS", "Tracking")
        l_v = cv2.getTrackbarPos("LV", "Tracking")

        u_h = cv2.getTrackbarPos("UH", "Tracking")
        u_s = cv2.getTrackbarPos("US", "Tracking")
        u_v = cv2.getTrackbarPos("UV", "Tracking")

        l_b = np.array([l_h, l_s, l_v])
        u_b = np.array([u_h, u_s, u_v])

        mask = cv2.inRange(hsv, l_b, u_b)
        mask = cv2.dilate(mask, None, iterations=2)
        mask = cv2.erode(mask, None, iterations=2)

        #---------------------------------

        # Set up the SimpleBlobdetector with default parameters.
        params = cv2.SimpleBlobDetector_Params()

        # Filter by Area.
        params.filterByArea = True
        params.minArea = 3.14159 * 25 * 25 # Min 50 Pixel Durchmesser
        params.maxArea = 3.14159 * 125 * 125 # Max 2500 Pixel Durchmesser

        # Change thresholds
        params.minThreshold = 0
        params.maxThreshold = 100

        # Filter by Circularity
        params.filterByCircularity = True
        params.minCircularity = 0.1

        # Filter by Inertia
        params.filterByInertia = True
        params.minInertiaRatio = 0.5

        # Filter by Convexity
        params.filterByConvexity = True
        params.minConvexity = 0.5

        # Apply blob detection
        detector = cv2.SimpleBlobDetector_create(params)

        # Reverse the mask: blobs are black on white
        reversemask = 255-mask
        keypoints = detector.detect(reversemask)

        # Detecting multiple Blobs or just the biggest one
        if keypoints:
            keypoints.sort(key=(lambda s: s.size))
            keypoints=keypoints[-1:] # [-1:] Der letzte und damit gr????te Blob, [-2:] f??r die zwei gr????ten Blobs

        # Returning Coordinates
        for en,keyPoint in enumerate(keypoints):
            x = keyPoint.pt[0] # x-Position
            y = keyPoint.pt[1] # y-Position
            s = keyPoint.size  # Durchmesser
            a = []
            
            # Send out Data as JSON
            global coords
            coords = {'xCoord':x, 'yCoord':y, 'size':s}

        #-- Draw detected blobs as red circles.
        #-- cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS ensures the size of the circle corresponds to the size of blob
        line_color=(0,0,255) #BGR
        frame_orig = cv2.drawKeypoints(frame_orig, keypoints, np.array([]), line_color, cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        mask = cv2.drawKeypoints(mask, keypoints, np.array([]), line_color, cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        
        #---------------------------------

        cv2.imshow("frame_orig", frame_orig)
        cv2.imshow("frame", frame)
        cv2.imshow("mask", mask)

        # Press esc to exit
        if cv2.waitKey(1) & 0xFF == 27:
            isRunning = False
            break

    cap.release()
    cv2.destroyAllWindows()
