// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useEffect, useRef, useState } from "react";
// import {
//         Animated,
//         Easing,
//         Image,
//         Platform,
//         Pressable,
//         StyleSheet,
//         Text,
//         View,
// } from "react-native";

// // Animation constants
// const DURATION = 500; 
// const QUICK_EASING = Easing.bezier(0.34, 1.56, 0.2, 1.05); 

// // ---------- TAB BAR CUSTOM ----------

// export function CustomTabBar({ state, navigation, avatarSource }) {
//   const [layouts, setLayouts] = useState([]);

//   // pill unique : position X + largeur
//   const translateX = useRef(new Animated.Value(0)).current;
//   const pillWidth = useRef(new Animated.Value(48)).current;
  
//   // Animations de position X pour chaque icône
//   const itemTranslateX = useRef(
//     state.routes.map(() => new Animated.Value(0))
//   ).current;
  
//   // Stocker les positions précédentes
//   const previousPositions = useRef(state.routes.map(() => 0));

//   const animateItemPositions = () => {
//     const itemAnimations = state.routes.map((_, index) => {
//       const layout = layouts[index];
//       if (!layout || layout.x === undefined) return null;
      
//       const previousX = previousPositions.current[index];
//       const newX = layout.x;
      
//       if (previousX === newX) return null;
      
//       const deltaX = previousX - newX; 
      
//       previousPositions.current[index] = newX;
      
//       itemTranslateX[index].setValue(deltaX);
      
//       return Animated.timing(itemTranslateX[index], {
//         toValue: 0,
//         duration: DURATION,
//         easing: QUICK_EASING,
//         useNativeDriver: true,
//       });
//     }).filter(Boolean);
    
//     if (itemAnimations.length > 0) {
//       Animated.parallel(itemAnimations).start();
//     }
//   };

//   useEffect(() => {
//     const currentLayout = layouts[state.index];
//     if (!currentLayout || currentLayout.contentWidth === undefined) return;

//     const targetWidth = currentLayout.contentWidth + 30;

//     Animated.parallel([
//       Animated.timing(translateX, {
//         toValue: currentLayout.x + (currentLayout.width - targetWidth) / 2,
//         duration: DURATION,
//         easing: QUICK_EASING,
//         useNativeDriver: false,
//       }),
//       Animated.timing(pillWidth, {
//         toValue: targetWidth,
//         duration: DURATION,
//         easing: QUICK_EASING,
//         useNativeDriver: false,
//       }),
//     ]).start();
    
//     animateItemPositions();
//   }, [state.index, layouts, translateX, pillWidth]);

//   const handleItemLayout = (index) => (e) => {
//       const { x, width } = e.nativeEvent.layout;
//       setLayouts((prev) => {
//         const next = [...prev];
//         const wasFirstTime = !next[index] || next[index].x === undefined;
//         next[index] = { ...next[index], x, width };
        
//         if (wasFirstTime) {
//           previousPositions.current[index] = x;
//           itemTranslateX[index].setValue(0);
//         }
        
//         return next;
//       });
//     };

//   const handleContentLayout = (index) => (e) => {
//       const { width } = e.nativeEvent.layout;
//       setLayouts((prev) => {
//         const next = [...prev];
//         const current = next[index];
//         if (!current || width > (current.contentWidth || 0)) {
//           next[index] = { ...next[index], contentWidth: width };
//         }
//         return next;
//       });
//     };

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.container}>
//         <Animated.View
//           style={[
//             styles.pill,
//             { width: pillWidth, transform: [{ translateX }] },
//           ]}
//         />

//         {state.routes.map((route, index) => {
//           const isFocused = state.index === index;

//           return (
//             <Animated.View
//               key={route.key}
//               style={[
//                 styles.tabWrapper,
//                 { transform: [{ translateX: itemTranslateX[index] }] },
//               ]}
//               onLayout={handleItemLayout(index)}
//             >
//               <TabBarItem
//                 routeName={route.name}
//                 isFocused={isFocused}
//                 navigation={navigation}
//                 avatarSource={avatarSource}
//                 onContentLayout={handleContentLayout(index)}
//               />
//             </Animated.View>
//           );
//         })}
//       </View>
//     </View>
//   );
// }

// function TabBarItem({ routeName, isFocused, navigation, avatarSource, onContentLayout }) {
//   const labelAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
//   const iconAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(labelAnim, {
//         toValue: isFocused ? 1 : 0,
//         duration: DURATION,
//         easing: QUICK_EASING,
//         useNativeDriver: true,
//       }),
//       Animated.timing(iconAnim, {
//         toValue: isFocused ? 1 : 0,
//         duration: DURATION,
//         easing: QUICK_EASING,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, [isFocused, labelAnim, iconAnim]);

//   const labelOpacity = labelAnim;
//   const labelTranslateX = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
//   const iconTranslateX = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

//   const label = (() => {
//     switch (routeName) {
//       case "ExploreScreen": return "explore";
//       case "Flights": return "cards";
//       case "PlanetScreen": return "planet";
//       case "MeScreen": return "me";
//       default: return routeName;
//     }
//   })();

//   const isProfile = routeName === "MeScreen";

//   const { activeIcon, inactiveIcon } = (() => {
//     switch (routeName) {
//       case "ExploreScreen":
//         return { activeIcon: "at", inactiveIcon: "at" };
//       case "Flights":
//         return { activeIcon: "albums", inactiveIcon: "albums-outline" };
//       case "PlanetScreen":
//         return { activeIcon: "planet", inactiveIcon: "planet-outline" };
//       case "MeScreen":
//         return { activeIcon: "person", inactiveIcon: "person-outline" };
//       default:
//         return { activeIcon: "at", inactiveIcon: "at" };
//     }
//   })();

//   const iconColor = isFocused ? "#ffffff" : "#000000";

//   const onPress = () => {
//     const event = navigation.emit({
//       type: 'tabPress',
//       target: routeName,
//       canPreventDefault: true,
//     });

//     if (!isFocused && !event.defaultPrevented) {
//       navigation.navigate(routeName);
//     }
//   };

//   return (
//     <Pressable
//       onPress={onPress}
//       style={styles.tabPressable}
//       android_ripple={{ color: "rgba(0,0,0,0.05)", borderless: true }}
//     >
//       <View style={styles.itemContent}>
//         <View style={styles.measureContent} onLayout={onContentLayout}>
//           {isProfile && avatarSource ? (
//             <Image source={avatarSource} style={styles.avatar} />
//           ) : (
//             <Ionicons name={activeIcon} size={35} color="#ffffff" />
//           )}
//           <Text style={styles.label} numberOfLines={1}>{label}</Text>
//         </View>

//         <View style={styles.visibleContent}>
//           <Animated.View style={{ alignItems: "center", justifyContent: "center", transform: [{ translateX: iconTranslateX }] }}>
//             {isProfile && avatarSource ? (
//               <Image source={avatarSource} style={styles.avatar} />
//             ) : (
//               <Ionicons name={isFocused ? activeIcon : inactiveIcon} size={35} color={iconColor} />
//             )}
//           </Animated.View>

//           <Animated.View style={{ opacity: labelOpacity, transform: [{ translateX: labelTranslateX }] }}>
//             {isFocused && (
//               <Text style={styles.label} numberOfLines={1}>{label}</Text>
//             )}
//           </Animated.View>
//         </View>
//       </View>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: Platform.select({ ios: 32, android: 24 }),
//     alignItems: "center",
//   },
//   container: {
//     position: "relative",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     backgroundColor: "#ffffff",
//     paddingHorizontal: 15,
//     paddingVertical: 5,
//     borderRadius: 999,
//     width: 350,
//     shadowColor: "#000",
//     shadowOpacity: 0.12,
//     shadowOffset: { width: 0, height: 8 },
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   pill: {
//     position: "absolute",
//     top: 5,
//     bottom: 5,
//     borderRadius: 999,
//     backgroundColor: "#000000",
//   },
//   tabWrapper: { alignItems: "center" },
//   tabPressable: { width: "100%" },
//   itemContent: {
//     position: "relative",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     height: 45,
//     paddingHorizontal: 5,
//   },
//   measureContent: {
//     position: "absolute",
//     flexDirection: "row",
//     alignItems: "center",
//     opacity: 0,
//     pointerEvents: "none",
//   },
//   visibleContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     height: 45,
//   },
//   avatar: { width: 35, height: 35, borderRadius: 999 },
//   label: {
//     marginLeft: 0,
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#ffffff",
//   },
// });

import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
        Animated,
        Easing,
        Image,
        Platform,
        Pressable,
        StyleSheet,
        Text,
        View,
} from "react-native";

// Animation constants
const DURATION = 500; 
const QUICK_EASING = Easing.bezier(0.34, 1.56, 0.2, 1.05); 

// ---------- TAB BAR CUSTOM ----------

export function CustomTabBar({ state, navigation, avatarSource }) {
  const [layouts, setLayouts] = useState([]);

  // pill unique : position X + largeur
  const translateX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(48)).current;
  
  // Animations de position X pour chaque icône
  const itemTranslateX = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;
  
  // Stocker les positions précédentes
  const previousPositions = useRef(state.routes.map(() => 0));

  const animateItemPositions = () => {
    const itemAnimations = state.routes.map((_, index) => {
      const layout = layouts[index];
      if (!layout || layout.x === undefined) return null;
      
      const previousX = previousPositions.current[index];
      const newX = layout.x;
      
      if (previousX === newX) return null;
      
      const deltaX = previousX - newX; 
      
      previousPositions.current[index] = newX;
      
      itemTranslateX[index].setValue(deltaX);
      
      return Animated.timing(itemTranslateX[index], {
        toValue: 0,
        duration: DURATION,
        easing: QUICK_EASING,
        useNativeDriver: true,
      });
    }).filter(Boolean);
    
    if (itemAnimations.length > 0) {
      Animated.parallel(itemAnimations).start();
    }
  };

  useEffect(() => {
    const currentLayout = layouts[state.index];
    if (!currentLayout || currentLayout.contentWidth === undefined) return;

    const targetWidth = currentLayout.contentWidth + 30;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: currentLayout.x + (currentLayout.width - targetWidth) / 2,
        duration: DURATION,
        easing: QUICK_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(pillWidth, {
        toValue: targetWidth,
        duration: DURATION,
        easing: QUICK_EASING,
        useNativeDriver: false,
      }),
    ]).start();
    
    animateItemPositions();
  }, [state.index, layouts, translateX, pillWidth]);

  const handleItemLayout = (index) => (e) => {
      const { x, width } = e.nativeEvent.layout;
      setLayouts((prev) => {
        const next = [...prev];
        const wasFirstTime = !next[index] || next[index].x === undefined;
        next[index] = { ...next[index], x, width };
        
        if (wasFirstTime) {
          previousPositions.current[index] = x;
          itemTranslateX[index].setValue(0);
        }
        
        return next;
      });
    };

  const handleContentLayout = (index) => (e) => {
      const { width } = e.nativeEvent.layout;
      setLayouts((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current || width > (current.contentWidth || 0)) {
          next[index] = { ...next[index], contentWidth: width };
        }
        return next;
      });
    };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.pill,
            { width: pillWidth, transform: [{ translateX }] },
          ]}
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          return (
            <Animated.View
              key={route.key}
              style={[
                styles.tabWrapper,
                { transform: [{ translateX: itemTranslateX[index] }] },
              ]}
              onLayout={handleItemLayout(index)}
            >
              <TabBarItem
                routeName={route.name}
                isFocused={isFocused}
                navigation={navigation}
                avatarSource={avatarSource}
                onContentLayout={handleContentLayout(index)}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

function TabBarItem({ routeName, isFocused, navigation, avatarSource, onContentLayout }) {
  const labelAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const iconAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(labelAnim, {
        toValue: isFocused ? 1 : 0,
        duration: DURATION,
        easing: QUICK_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(iconAnim, {
        toValue: isFocused ? 1 : 0,
        duration: DURATION,
        easing: QUICK_EASING,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, labelAnim, iconAnim]);

  const labelOpacity = labelAnim;
  const labelTranslateX = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const iconTranslateX = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  const label = (() => {
    switch (routeName) {
      case "ExploreScreen": return "explore";
      case "Flights": return "cards";
      case "PlanetScreen": return "planet";
      case "MeScreen": return "me";
      default: return routeName;
    }
  })();

  const isProfile = routeName === "MeScreen";

  const { activeIcon, inactiveIcon } = (() => {
    switch (routeName) {
      case "ExploreScreen":
        return { activeIcon: "at", inactiveIcon: "at" };
      case "Flights":
        return { activeIcon: "albums", inactiveIcon: "albums-outline" };
      case "PlanetScreen":
        return { activeIcon: "planet", inactiveIcon: "planet-outline" };
      case "MeScreen":
        return { activeIcon: "person", inactiveIcon: "person-outline" };
      default:
        return { activeIcon: "at", inactiveIcon: "at" };
    }
  })();

  const iconColor = isFocused ? "#ffffff" : "#000000";

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabPressable}
      android_ripple={{ color: "rgba(0,0,0,0.05)", borderless: false }}
      hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
    >
      <View style={styles.itemContent}>
        <View style={styles.measureContent} onLayout={onContentLayout}>
          {isProfile && avatarSource ? (
            <Image source={avatarSource} style={styles.avatar} />
          ) : (
            <Ionicons name={activeIcon} size={35} color="#ffffff" />
          )}
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </View>

        <View style={styles.visibleContent}>
          <Animated.View style={{ alignItems: "center", justifyContent: "center", transform: [{ translateX: iconTranslateX }] }}>
            {isProfile && avatarSource ? (
              <Image source={avatarSource} style={styles.avatar} />
            ) : (
              <Ionicons name={isFocused ? activeIcon : inactiveIcon} size={35} color={iconColor} />
            )}
          </Animated.View>

          <Animated.View style={{ opacity: labelOpacity, transform: [{ translateX: labelTranslateX }] }}>
            {isFocused && (
              <Text style={styles.label} numberOfLines={1}>{label}</Text>
            )}
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.select({ ios: 32, android: 24 }),
    alignItems: "center",
  },
  container: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 999,
    width: 350,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  pill: {
    position: "absolute",
    top: 5,
    bottom: 5,
    borderRadius: 999,
    backgroundColor: "#000000",
  },
  tabWrapper: { 
    alignItems: "center" 
  },
  tabPressable: { 
    minWidth: 60,
    height: 55,
    alignItems: "center",
    justifyContent: "center"
  },
  itemContent: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 45,
    paddingHorizontal: 5,
  },
  measureContent: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    opacity: 0,
    pointerEvents: "none",
  },
  visibleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 45,
  },
  avatar: { width: 35, height: 35, borderRadius: 999 },
  label: {
    marginLeft: 0,
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
});