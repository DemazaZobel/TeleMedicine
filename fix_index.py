import re

with open('app/(tabs)/index.tsx', 'r') as f:
    content = f.read()

# 1. Fix filter logic
content = content.replace(
    "if (!selectedSpecialization) return mixedAllDoctors;",
    "if (!selectedSpecialization || selectedSpecialization.toLowerCase() === 'all') return mixedAllDoctors;"
)

# 2. Remove the outer EmptyState wrapper
outer_wrapper_old = """        {!isLoading && !doctors.length ? (
          <EmptyState
            icon="search-outline"
            title="No Doctors Found"
            description="Try adjusting your filters to discover more providers."
          />
        ) : (
          <>
            <FadeInSection delay={170}>"""

outer_wrapper_new = """        <FadeInSection delay={170}>"""
content = content.replace(outer_wrapper_old, outer_wrapper_new)

# 3. Add inner EmptyState
inner_grid_old = """                <Animated.View style={isCategoryTransitioning ? styles.transitionFade : undefined}>
                  <View style={styles.grid}>
                    {(isLoading || isCategoryTransitioning)
                      ? Array.from({ length: isMobile ? 2 : isTablet ? 4 : 6 }).map((_, idx) => (
                          <Card key={`skeleton-${idx}`} style={[styles.gridCard, { width: doctorCardWidth }]}>
                            <View style={styles.skeletonAvatar} />
                            <View style={styles.skeletonLineLg} />
                            <View style={styles.skeletonLineSm} />
                            <View style={styles.skeletonLineMd} />
                            <View style={styles.skeletonBtn} />
                          </Card>
                        ))
                      : doctorsToRender.map((doctor) => {"""

inner_grid_new = """                <Animated.View style={isCategoryTransitioning ? styles.transitionFade : undefined}>
                  {(isLoading || isCategoryTransitioning) ? (
                    <View style={styles.grid}>
                      {Array.from({ length: isMobile ? 2 : isTablet ? 4 : 6 }).map((_, idx) => (
                        <Card key={`skeleton-${idx}`} style={[styles.gridCard, { width: doctorCardWidth }]}>
                          <View style={styles.skeletonAvatar} />
                          <View style={styles.skeletonLineLg} />
                          <View style={styles.skeletonLineSm} />
                          <View style={styles.skeletonLineMd} />
                          <View style={styles.skeletonBtn} />
                        </Card>
                      ))}
                    </View>
                  ) : filteredDoctors.length === 0 ? (
                    <Card style={styles.emptyCategoryCard}>
                      <View style={styles.emptyCategoryIconWrap}>
                        <Ionicons name="search-outline" size={32} color={theme.colors.primary} />
                      </View>
                      <Text style={styles.emptyCategoryTitle}>No doctors found</Text>
                      <Text style={styles.emptyCategoryText}>
                        We couldn't find any {selectedSpecialization && selectedSpecialization !== 'All' ? selectedSpecialization : ''} doctors matching your criteria.
                      </Text>
                      <Pressable 
                        style={({ pressed }) => [styles.clearFilterBtn, pressed && styles.viewBtnPressed]}
                        onPress={() => setSelectedSpecialization('All')}
                      >
                        <Text style={styles.clearFilterBtnText}>Clear Filter</Text>
                      </Pressable>
                    </Card>
                  ) : (
                    <View style={styles.grid}>
                      {doctorsToRender.map((doctor) => {"""
content = content.replace(inner_grid_old, inner_grid_new)

# 4. Close the grid View properly
grid_close_old = """                          );
                        })}
                  </View>
                </Animated.View>"""

grid_close_new = """                          );
                        })}
                    </View>
                  )}
                </Animated.View>"""
content = content.replace(grid_close_old, grid_close_new)

# 5. Remove the closing of the outer wrapper
bottom_close_old = """            </FadeInSection>
          </>
        )}
      </ScrollView>"""

bottom_close_new = """            </FadeInSection>
      </ScrollView>"""
content = content.replace(bottom_close_old, bottom_close_new)

# 6. Add the styles
styles_old = """    gridCardFeatured: {
      borderWidth: 1,
      borderColor: theme.colors.primary + '55',
    },"""

styles_new = """    gridCardFeatured: {
      borderWidth: 1,
      borderColor: theme.colors.primary + '55',
    },
    emptyCategoryCard: {
      borderRadius: 18,
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8faf9',
      borderWidth: 1,
      borderColor: '#e5ece9',
      marginTop: 16,
    },
    emptyCategoryIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#e9fbf4',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyCategoryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptyCategoryText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      maxWidth: 320,
      marginBottom: 24,
    },
    clearFilterBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
    },
    clearFilterBtnText: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '700',
    },"""
content = content.replace(styles_old, styles_new)

with open('app/(tabs)/index.tsx', 'w') as f:
    f.write(content)
print("Fix applied successfully")
