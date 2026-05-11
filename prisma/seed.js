const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding levels, categories and lessons...\n');

  const data = [
    {
      levelNumber: 1,
      name: 'Level 1',
      categories: [
        { name: 'Counting',  totalLessons: 4 },
        { name: 'Sorting',   totalLessons: 2 },
        { name: 'Pegboard',  totalLessons: 4 },
        { name: 'Senses',    totalLessons: 1 },
        { name: 'Matching',  totalLessons: 1 },
        { name: 'Drawing',   totalLessons: 1 },
        { name: 'Self Care', totalLessons: 1 },
        { name: 'Feelings',  totalLessons: 1 },
      ],
    },
    {
      levelNumber: 2,
      name: 'Level 2',
      categories: [
        { name: 'Draw Line', totalLessons: 5 },
        { name: 'Big',       totalLessons: 1 },
        { name: 'Small',     totalLessons: 1 },
        { name: 'Tall',      totalLessons: 1 },
        { name: 'Short',     totalLessons: 1 },
        { name: 'Thin',      totalLessons: 1 },
        { name: 'Shapes',    totalLessons: 1 },
      ],
    },
    {
      levelNumber: 3,
      name: 'Level 3',
      categories: [
        { name: 'Letters',    totalLessons: 20 },
        { name: 'Numbers',    totalLessons: 10 },
        { name: 'Colors',     totalLessons: 0  },
        { name: 'Fruits',     totalLessons: 1  },
        { name: 'Vegetables', totalLessons: 1  },
        { name: 'Family',     totalLessons: 1  },
        { name: 'Animals',    totalLessons: 6  },
      ],
    },
  ];

  for (const levelData of data) {
    const level = await prisma.level.upsert({
      where: { levelNumber: levelData.levelNumber },
      update: { name: levelData.name },
      create: { levelNumber: levelData.levelNumber, name: levelData.name },
    });

    console.log(` ✓ ${level.name}`);

    for (const cat of levelData.categories) {
      const existing = await prisma.category.findFirst({
        where: { name: cat.name, levelId: level.id },
      });

      let category;
      if (!existing) {
        category = await prisma.category.create({
          data: {
            name: cat.name,
            levelId: level.id,
            totalLessons: cat.totalLessons,
          },
        });
        console.log(`    + ${cat.name} (${cat.totalLessons} lessons)`);
      } else {
        category = await prisma.category.update({
          where: { id: existing.id },
          data: { totalLessons: cat.totalLessons },
        });
        console.log(`    ✓ ${cat.name} (${cat.totalLessons} lessons)`);
      }

      // إضافة الـ lessons لكل category
      for (let i = 1; i <= cat.totalLessons; i++) {
        const lessonTitle = `${cat.name} - Lesson ${i}`;

        const existingLesson = await prisma.lesson.findFirst({
          where: { title: lessonTitle, categoryId: category.id },
        });

        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              title: lessonTitle,
              categoryId: category.id,
            },
          });
        }
      }
    }
    console.log('');
  }

  // Summary
  const levels = await prisma.level.findMany({
    include: { categories: { include: { lessons: true } } },
    orderBy: { levelNumber: 'asc' },
  });

  console.log('📋 Database Summary:');
  console.log('====================');
  for (const l of levels) {
    const totalLessons = l.categories.reduce((s, c) => s + c.lessons.length, 0);
    console.log(`\n${l.name} — ${l.categories.length} categories — ${totalLessons} total lessons:`);
    l.categories.forEach((c) =>
      console.log(`  [id:${c.id}] ${c.name.padEnd(14)} → ${c.lessons.length} lesson(s)`)
    );
  }

  console.log('\n✅ Seed done!');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());