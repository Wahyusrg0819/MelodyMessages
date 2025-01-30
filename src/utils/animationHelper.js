import { Animated, Easing } from 'react-native';

// Animasi fade in sederhana
export const createFadeInAnimation = (fadeAnim) => {
  return Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  });
};

// Animasi slide sederhana
export const createSlideAnimation = (slideAnim, toValue) => {
  return Animated.spring(slideAnim, {
    toValue,
    useNativeDriver: true,
    damping: 20,
  });
};

// Animasi scale sederhana untuk feedback
export const createScaleAnimation = (scaleAnim) => {
  return Animated.sequence([
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      damping: 10,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
    }),
  ]);
};

export const createStaggeredAnimation = (animations, delay = 100) => {
  return Animated.stagger(delay, animations);
};

export const createPulseAnimation = (pulseAnim) => {
  return Animated.sequence([
    Animated.spring(pulseAnim, {
      toValue: 1.1,
      useNativeDriver: true,
      damping: 3,
      stiffness: 200,
    }),
    Animated.spring(pulseAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 3,
      stiffness: 200,
    }),
  ]);
};

export const createShakeAnimation = (shakeAnim) => {
  return Animated.sequence([
    Animated.timing(shakeAnim, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
    Animated.timing(shakeAnim, {
      toValue: -10,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
    Animated.timing(shakeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
  ]);
};

// Animasi untuk tombol putar
export const createPlayButtonAnimation = (scaleAnim, opacityAnim) => {
  return Animated.parallel([
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }),
    ]),
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]),
  ]);
}; 
